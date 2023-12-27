---
title: 'EF Core For Junior Devs: #1 - What is Entity Framework Core?'
description: 'EF Core For Junior Devs #1'
pubDate: '2023-12-23'
thumbnailImage: './thumbnail.png'
author: Josh Hills
status: draft
tags: []
---

- [Background](#background)
- [Introduction](#introduction)
- [EF vs. EF Core](#ef-vs-ef-core)
- [Database Providers](#database-providers)

## Background

Hey, I'm Josh. I'm a software engineer who works with Entity Framework Core every day at work and in personal projects. I spent two years as a grad, and found EF Core to be one of the most difficult things to understand initially as a junior dev. It's incredibly powerful, but I find it very easy to go wrong and there are not many protections built in to prevent you from doing so. I've spent a lot of time learning EF Core, the common pitfalls and traps people fall into and doing some important query optimisations to speed up our applications. So, I'm writing this series of posts to share some of this knowledge in language any dev should find easy enough to comprehend. I'm neither a writer nor an expert though, so please create issues and/or PRs on this [GitHub repo](https://github.com/joshuahills/joshuahills.github.io) if you find any content to be incorrect, out-of-date, or difficult to understand.

I believe this kind of learning is not something you can achieve solely by reading posts like these, but it should help you. I'll cover as much as I can, with realistic examples. Let's get started.

## Introduction

Entity Framework (EF) Core is an ORM - an "object relational mapper" - for .NET. What does that mean? Well, EF Core sits as a layer between your application and the database. It maps database entities to objects for you to use in your application, and vice versa.

There are two approaches that EF Core supports: "code-first" and "database-first". In the code-first approach, you define your entity model, i.e. the class representing the entity, in your code. EF Core will translate that into a database representation of the model, e.g. a table with defined columns. On the other hand, the database-first approach means EF Core will generate models from your existing database schema.

We'll cover the code-first approach as that is most common.

## EF vs. EF Core

An important point to make before going any further is that there are two different things that share the Entity Framework name. The original "Entity Framework" as it is formally known, is no longer under active development. That means no new features are being added. Its final version is version 6 (first released in 2013!), so it is also known as EF6. The latest EF6 version is still supported by Microsoft however, meaning they will provide security fixes until this support ends. As of writing, there are [no plans to end this support](https://learn.microsoft.com/en-us/ef/efcore-and-ef6/support#entity-framework-60-61-62-63-and-64).

The other, Entity Framework Core, is a complete rewrite of EF with loads of improvements, including significant performance improvements. EF Core can only be used with .NET Core (which is now just called .NET). EF6 can be used with both, but for any new application [Microsoft recommends EF Core](https://learn.microsoft.com/en-us/ef/efcore-and-ef6/support#entity-framework-core).

I will refer to Entity Framework Core as "EF Core", and Entity Framework 6 as "EF6" but bear it in mind when looking for resources online.

Despite rewriting the original Entity Framework, EF Core retains many of the original concepts and practices but there are some important distinctions that I'll make in this and subsequent posts.

## Database Providers

To help translate your queries into the appropriate SQL query, there are several providers available for various databases. The most common are listed below:

- Microsoft SQL Server (also supports Azure SQL)
- MySQL and MariaDB
- PostgreSQL
- SQLite
- Azure Cosmos DB
- In memory database

We'll use the MS SQL Server provider in our examples in the next posts.
