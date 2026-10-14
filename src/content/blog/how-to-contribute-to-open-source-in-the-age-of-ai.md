---
author: David Xie Han Keong
pubDatetime: 2026-10-15T00:00:00Z
modDatetime: 2026-10-15T00:00:00.000Z
title: How to Contribute to Open Source in the Age of AI
slug: how-to-contribute-to-open-source-in-the-age-of-ai
featured: false
draft: false
tags:
  - open source
  - AI
  - WomenDevsSG
description: "Code is getting cheap. Attention isn't. How to use AI coding agents to make contributions maintainers actually want to merge."
---

AI coding agents have made contributing to open source remarkably easy. You can find an issue, point an agent at the repository, and ask it to investigate the problem, write a fix, add tests, and prepare a pull request—all before you have properly understood the project yourself.

That is useful, especially when you are new to a codebase. But a pull request that takes minutes to generate can still take a maintainer much longer to understand, review, and decide whether it belongs.

**Code is getting cheap. Attention isn't.**

So before asking an AI coding agent what it can build, start with a better question: _How can I actually help?_

## Open source is community service

I like to think of open source as community service. You are stepping into something other people have spent their time and energy building, often over many years, and offering to make it a little better.

That does not always mean writing code. A clear bug report, minimal reproduction, missing test, documentation fix, or careful investigation may be more useful than another pull request. The goal is not to collect contributions. It is to leave the project better than you found it.

Before touching the code, understand why the project exists and what it needs today. Read the issues and discussions, notice where users are struggling, and pay attention to where maintainers are already spending their limited time.

## Read the room before you write the code

Every mature project develops its own direction and way of thinking. You can see it in the features maintainers pursue, the complexity they avoid, and sometimes most clearly in the ideas they choose _not_ to pursue.

Browse recent issues, releases, discussions, pull requests, and code reviews. Look beyond what was built and ask why those decisions were made. Where is the project going, and how do its maintainers imagine it becoming a better solution?

This is where AI can be genuinely helpful. Instead of immediately asking an agent to implement an issue, use it to trace earlier decisions, explain unfamiliar code, compare similar changes, and uncover conventions that may never have made it into `CONTRIBUTING.md`.

You are not trying to copy the maintainer's style. You are trying to follow their train of thought closely enough that your contribution feels like it belongs there.

**Help them complete the sentence.**

## Make your contribution cheap to consume

Every issue, commit, comment, and pull request asks for somebody else's attention. Keep changes focused, commits atomic, and larger work broken into sensible pieces. If your agent spots five unrelated things it could refactor along the way, resist the temptation.

Prefer clear names and straightforward implementations, and let readable code explain itself where possible. Use comments when they preserve context the code cannot, such as an unusual constraint or a deliberate trade-off.

Write your pull request for a tired human being, not another language model. Explain what happened, what changed, and why. Then stop when you have said enough.

## Your agent didn't open the PR. You did.

Use AI to explore the repository, investigate bugs, challenge assumptions, write code, add tests, or review your work. Those are useful shortcuts through an unfamiliar codebase.

But once you submit the work, it is yours. Read the diff, run the tests, try the behavior, question anything you do not understand, and remove anything that does not belong. If a maintainer asks why you chose an approach, you should be able to explain it yourself.

You do not need to type every line. You do need to stand behind it.

## Start here, not with code

If you are making your first open source contribution with an AI coding agent, try this before asking it to implement anything:

> I want to contribute meaningfully to this open-source project. Don't write code yet.
>
> First, understand the project. Read its README, contribution guide, documentation, roadmap, recent releases, issues, discussions, and relevant pull requests.
>
> Explain what problem it solves, who it solves it for, where it is heading, and the important decisions or trade-offs its maintainers have made.
>
> Help me find a problem that genuinely matters and investigate it before proposing a solution. Find the smallest useful contribution that moves the project forward, whether that is code, a test, documentation, a reproduction, an investigation, or a better issue.
>
> Keep changes focused. Avoid unrelated refactors and unnecessary complexity.
>
> Before I submit anything, review it from the maintainer's perspective. Remove noise, challenge assumptions, and make sure I can understand and explain everything I am submitting.
>
> Don't try to impress the maintainer. Understand what they are trying to do and help them complete the sentence.

## Just be human

AI has lowered the barrier to contributing to open source. You don't need to know the whole codebase, have the perfect solution, or write every line yourself before you can help.

Be curious. Pay attention. Understand what people are trying to build and why. Care enough to leave things a little better than you found them.

AI can help you navigate the code. **You decide what's worth doing, and you stand behind what you contribute.**

If you want to put this into practice, WDS's Community Coding Month gives you a place to start. Browse our [projects and open issues](https://github.com/Women-Devs-SG), pick one you're curious about, and use the prompt above to understand it before deciding what to contribute.

**Understand what matters. Learn where the project is going. Help move it forward. That's how to contribute to open source in the age of AI.**
