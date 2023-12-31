---
title: 'EF Core Performance Best Practices'
description: 'EF Core Performance Best Practices'
pubDate: '2023-12-31'
author: Josh Hills
status: published
tags: ['EF Core']
---

Entity Framework Core is an incredibly powerful ORM. It can handle translating complicated LINQ queries into reasonably good SQL *most* of the time.

There are, however, some things it isn't quite so good at. I've also found it quite easy to go wrong with certain things. During my time working with EF Core, I've come up with a list of best practices that help me write performant queries so will share some of them in this post.

## Always review the generated SQL

This should go without saying, but it's easy to miss when you're in a hurry. I recommend enabling EF Core query logging so you can easily inspect all SQL queries it sends to the database when running in Debug mode. This is really useful to ensure queries are performant. This is a non-exhaustive list of things I always try to look out for in those logs:

- Make sure the query doesn't include any unexpected `JOIN`s. If it does, you probably have a redundant `.Include()` or `.ThenInclude()` somewhere in your query, or are using a property on related entity that perhaps you don't need. Unnecessary `JOIN`s can cripple your database at load!
- Ensure there are no unnecessary properties being `SELECT`ed. I'll talk more about this later, but make sure you only `SELECT` what you need.
- If you do have a complicated query that has more than one `JOIN` in the generated SQL, EF Core will (by default) log a warning message saying that it may not be the most efficient query. And it's sometimes right. You can get better performance by splitting the query up manually, or by letting EF Core do it for you with `.AsSplitQuery()`. It depends though, you should always benchmark each case to determine what is most efficient.

## Don't use lazy-loading

EF6 (the previous version of EF for .NET Framework) had lazy-loading enabled by default. That might have been useful for quick development, but it harms performance. Lazy-loading means multiple round-trips to a database every time a new navigation is used. Consider a scenario where you've got a database of books and authors. With lazy-loading enabled, the code below will log each book title and its corresponding author to the console.

```c#
using var context = new LibraryContext();

foreach (var author in context.Authors.ToList())
{
  foreach (var book in author.Books)
  {
    Console.WriteLine($"{book.Title} by {book.Author.Name}");
  }
}
```

However, it doesn't go about it in an efficient manner. EF Core logs the following queries:

One to get all of the authors:

```sql
  SELECT [a].[Id], [a].[Name]
  FROM [Authors] AS [a]
```

For each author returned, get that author's books:

```sql
SELECT [b].[Id], [b].[AuthorId], [b].[Title]
FROM [Books] AS [b]
WHERE [b].[AuthorId] = @__p_0
```

If you've got 50 authors in your database, that's **51 queries** in total, meaning 51 database round-trips. Not good.

So what's the alternative? Well, turning off lazy loading isn't a solution in this case because EF doesn't know to do a `JOIN` to the `Books` table. It executed the same query to get the author, and then nothing else. So now no books are logged to the console at all. Not a problem, without lazy-loading, we are just explicit about what data we need and where:

```c#
using var context = new LibraryContext();

foreach (var author in context.Authors.Include(a => a.Books).ToList())
{
  foreach (var book in author.Books)
  {
    Console.WriteLine($"{book.Title} by {book.Author.Name}");
  }
}
```

The use of `.Include()` explicitly tells EF Core to get the authors' books in the same query. It generates the following SQL:

```sql
SELECT [a].[Id], [a].[Name], [b].[Id], [b].[AuthorId], [b].[Title]
FROM [Authors] AS [a]
LEFT JOIN [Books] AS [b] ON [a].[Id] = [b].[AuthorId]
ORDER BY [a].[Id]
```

And all those books are logged to the console again. Much better.

## Don't track changes for read-only queries

By default, EF Core will load entities returned from the database into the change tracker. This means memory allocations for each of those entities. For read-only queries, this operation is pointless. You can tell EF Core to not do this by appending `.AsNoTracking()` onto the query. Here's some benchmarks and their results with 5000 books:

```cs
[Benchmark]
public List<Book> GetBooks_NoTracking()
{
  using var context = new LibraryContext();
  return context.Books.AsNoTracking().ToList();
}

[Benchmark]
public List<Book> GetBooks_WithTracking()
{
  using var context = new LibraryContext();
  return context.Books.ToList();
}
```

| Method                | Mean     | Error     | StdDev    | Allocated |
|---------------------- |---------:|----------:|----------:|----------:|
| GetBooks_NoTracking   | 3.223 ms | 0.0555 ms | 0.0896 ms |   1.77 MB |
| GetBooks_WithTracking | 9.049 ms | 0.1772 ms | 0.3240 ms |   5.19 MB |

## Only project required properties

When you've got tables with many columns and joins to tables with even more columns, it becomes increasingly important to only grab the data you need from the database. EF Core makes this relatively easy using the LINQ `.Select()` method. In the benchmark below, I just project the book title and author name to an anonymous type:

```c#
[Benchmark]
public void GetBooks_WithProjection()
{
  using var context = new LibraryContext();
  _ = context.Books
    .AsNoTracking()
    .Include(b => b.Author)
    .Select(b => new
    {
        b.Title,
        b.Author.Name,
    })
    .ToList();
}

[Benchmark]
public void GetBooks_WithoutProjection()
{
  using var context = new LibraryContext();
  _ = context.Books
    .AsNoTracking()
    .Include(b => b.Author)
    .ToList();
}
```

| Method                     | Mean     | Error     | StdDev    | Allocated |
|--------------------------- |---------:|----------:|----------:|----------:|
| GetBooks_WithProjection    | 5.321 ms | 0.1016 ms | 0.0951 ms |   2.19 MB |
| GetBooks_WithoutProjection | 6.631 ms | 0.1675 ms | 0.4887 ms |   4.21 MB |

Even cooler, EF Core knows the first benchmark is a read-only query and will also automatically add a `JOIN` to get the author's name without explicitly doing it in LINQ - omitting `.AsNoTracking()` and `.Include(b => b.Author)` will have the same result as including them. I prefer to be explicit.

The first method generates the following SQL:

```sql
SELECT [b].[Title], [a].[Name]
FROM [Books] AS [b]
INNER JOIN [Authors] AS [a] ON [b].[AuthorId] = [a].[Id]
```

While the second grabs everything:

```sql
SELECT [b].[Id], [b].[AuthorId], [b].[Title], [a].[Id], [a].[Name]
FROM [Books] AS [b]
INNER JOIN [Authors] AS [a] ON [b].[AuthorId] = [a].[Id]
```

So be sure to use projection liberally to ensure EF Core will only get the properties you need.

> Note:
> I often see mapping to DTOs done via the DTO's constructor. This is not the same as the above example, as EF cannot determine what properties will be needed in the constructor, so it will grab everything.

## Other tips

Some more tips that I want to write more about in the future:

- Use pagination instead of grabbing all entities. This requires slightly more complicated frontend logic but is well worth it.
- Don't be afraid to rewrite queries. If EF Core generates SQL that leads to your database not using an index, try rewriting it. You can now write raw SQL in EF Core to give you even more control of what EF Core sends to your DB.
- [Compiled queries](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics?tabs=with-di%2Cexpression-api-with-constant#compiled-queries) means EF Core can convert LINQ to SQL at compile time, rather than during runtime. This reduces the overhead spent generating common queries over-and-over again with potentially significant performance gains. I've found this works best with very simple queries so far, hopefully the EF Core team invest more as this would be an excellent feature for complicated queries.
- Parameterize queries so EF Core caches the query plan and reuses it.
- In high throughput applications, [pooled DbContexts](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics?tabs=with-di%2Cexpression-api-with-constant#dbcontext-pooling) can reduce the overhead of instantiating a new DbContext many times per second by creating them at start-up, using one from a pool and then returning it to the pool for reuse.

## Final thoughts

EF Core is truly great. I do not believe a better ORM exists for any language. The EF Core team have done a great job rewriting EF6 from the ground up and we can see the benefits in performance improvements. I hope this was of use to you. Please submit issues on [GitHub](https://github.com/joshuahills/joshuahills.github.io) should any of this content be out-of-date or if you have more performance tips.

## Further reading

- Setup and fine-tune EF Core logs with this article from MS: [Overview of Logging and Interception](https://learn.microsoft.com/en-us/ef/core/logging-events-diagnostics/)
- More tips on efficient querying from the EF Core team themselves: [Efficient Querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying)
- Efficient queries are not the only thing that can improve performance in your application. It starts with having a good DB model. [Read more here](https://learn.microsoft.com/en-us/ef/core/performance/modeling-for-performance)
