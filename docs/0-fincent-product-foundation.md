# FinCent — Problem, Product Vision, USP, and Use Cases

> Status: Product foundation v0.1  
> Purpose: Align on the problem and product value before designing the UI,
> system architecture, or writing code.

## 1. Project Summary

**FinCent** is an AI-powered personal finance application that helps users:

- record daily income and expenses with minimal effort;
- understand where their money goes and assess their current financial health;
- proactively manage budgets, bills, and savings goals;
- receive actionable alerts, explanations, and recommendations based on their
  own financial data.

FinCent is more than a digital expense ledger. The product should turn
disconnected transaction data into clear answers to three questions:

1. **Now:** Where is my money, and what have I spent it on?
2. **Next:** How much can I safely spend between now and the end of the month?
3. **Action:** What should I do to reach my financial goals without
   compromising essential needs?

### Product Positioning Statement

> For people who want to manage their income and expenses but lack the time or
> knowledge to maintain spreadsheets, FinCent is a personal finance assistant
> that makes recording transactions fast, automatically explains cash flow,
> and recommends actions suited to each user's circumstances.

## 2. Context and Problems to Solve

### 2.1. Users Lack a Complete View of Their Finances

Money is distributed across cash, bank accounts, digital wallets, credit
cards, and personal loans. Users often remember the balances of only a few
accounts and do not know their exact available assets, total debt, or actual
monthly cash flow.

**Consequences:**

- users misjudge how much they can afford to spend;
- debts or upcoming bills are overlooked;
- users cannot tell whether this month is better or worse than the previous
  one;
- problems are discovered only when an account is nearly empty.

### 2.2. Manual Tracking Creates Too Much Friction

Traditional expense-tracking applications require users to open the app, enter
an amount, select a category and account, specify a date, and add notes for
every transaction. A single transaction is easy, but repeating the process
several times a day causes users to abandon the habit.

**Consequences:**

- data becomes incomplete or inconsistent;
- balances in the application differ from reality;
- reports become unreliable;
- users lose the motivation to return.

### 2.3. Data Does Not Lead to Decisions

Category charts and total-spending figures explain only what has already
happened. Users must still determine:

- which expense is increasing unusually;
- why they are running short of money this month;
- where they should cut spending;
- whether they can afford a purchase;
- how much they need to save each month to reach a goal.

This is the gap between **tracking money** and **managing finances**.

### 2.4. Static Budgets Do Not Reflect Real Life

Income and expenses can change from month to month. A fixed limit such as
“$300 for food per month” does not account for the amount already spent, days
remaining, upcoming bills, or unexpected expenses.

**Consequences:**

- budgets become figures to observe rather than decision-making tools;
- users exceed budgets before realizing it;
- alerts arrive too late or without sufficient context.

### 2.5. Financial Goals Lack Feasible Plans

Users have goals such as building an emergency fund, buying a vehicle, taking
a vacation, or repaying debt. However, they often do not know:

- whether the goal is realistic given their current cash flow;
- how much to contribute each week or month;
- how overspending changes the expected completion date;
- which goal to prioritize.

### 2.6. Generic Financial Advice Does Not Fit Individual Circumstances

Advice such as “save 20% of your income” or the 50/30/20 model can be useful as
a reference but does not apply to everyone. Users need explanations based on
their own income, mandatory expenses, habits, and goals.

### 2.7. Trust and Privacy Are Core Barriers

Financial data is highly sensitive. Users will not adopt the product if:

- they do not know which data is collected or how it is used;
- AI presents figures without explaining their source;
- transactions are changed automatically without confirmation;
- users cannot correct, export, or delete their data;
- the product presents recommendations as advice from a licensed financial
  adviser.

## 3. Target Users

### 3.1. Primary MVP Segment

**Employed adults aged 22–35 with relatively stable income** who use multiple
accounts or payment methods, want to control their spending, but have not
maintained a consistent tracking habit.

Typical characteristics:

- receive a monthly salary;
- have recurring expenses and many small daily transactions;
- are comfortable using web and mobile applications;
- want to save toward at least one goal;
- do not need a complex personal accounting system;
- prefer quick answers over advanced financial reports.

### 3.2. Potential Post-MVP Segments

- freelancers or people with irregular income;
- couples or families managing shared wallets and goals;
- people with multiple loans or credit cards;
- users tracking investments and asset values;
- users who want automatic bank transaction synchronization.

These segments have substantially different needs and should not all be
included in the MVP.

## 4. Jobs to Be Done

### Functional Jobs

- When a transaction occurs, I want to record it in a few seconds so my data
  remains complete.
- When I open the application, I want to know how much I can actually spend so
  I do not exceed my means.
- When my spending increases, I want to know why and understand the impact
  before it is too late.
- When a recurring bill is due, I want a timely reminder and want it included
  in my projected cash flow.
- When I set a goal, I want a feasible contribution plan and a clear view of
  whether I am on track.
- When I have a question about money, I want an answer based on my data rather
  than generic advice.

### Emotional Jobs

- feel in control of money instead of avoiding balance checks;
- reduce anxiety about the end of the month and unexpected expenses;
- feel confident that today's spending will not compromise long-term goals;
- feel that managing finances is simple and produces visible progress.

## 5. Core Value Proposition and USP

### Proposed USP

> **FinCent turns daily transactions into an actionable financial plan through
> fast data entry, AI-powered cash-flow understanding, and a continuously
> updated view of how much the user can safely spend.**

### Three Differentiating Pillars

#### 1. Capture Fast — Low-Friction Data Entry

- enter a transaction using natural language, for example:
  “Lunch 65k cash today”;
- automatically suggest the transaction type, category, account, and time;
- learn from previous corrections to improve future categorization;
- support recurring transactions and frequently used templates.

#### 2. Understand Clearly — Explain, Do Not Just Visualize

- summarize cash flow in plain language;
- identify unusual changes or expenses;
- explain which factors have affected a budget or delayed a goal;
- ensure every AI conclusion can be traced to the relevant transactions and
  calculations.

#### 3. Act Confidently — Recommend Specific Actions

- calculate **Safe-to-Spend**: the estimated amount a user can spend between now
  and the next income date after accounting for essential expenses, bills, and
  goal contributions;
- warn users before they are likely to exceed a budget;
- recommend quantified adjustments with a clear timeframe;
- simulate impact, for example: “If I make this purchase, how many days will my
  goal be delayed?”

### What FinCent Does Not Compete On

- it is not merely an application with an attractive dashboard;
- it is not a financial chatbot that provides generic knowledge;
- it is not complex personal accounting software;
- it does not promise investment returns or replace financial professionals;
- it does not automatically execute real-money transactions in the initial
  stages.

## 6. Principles for Using AI

AI is an interaction and analysis layer, not the sole source of truth.

### AI Should

- extract structured data from natural-language transaction input;
- suggest categories and identify potentially recurring transactions;
- summarize trends from data already calculated by the system;
- explain changes and recommend actions;
- answer questions using data the user has authorized;
- clearly state assumptions when data is incomplete.

### AI Should Not Independently

- create, modify, or delete transactions without allowing the user to review
  the change;
- transfer money, make investments, or subscribe to financial products;
- fabricate figures when data is missing;
- guarantee returns or future results;
- obscure how important metrics are calculated;
- send all financial data to a model when only a subset is required.

### Trust Rules

1. **Deterministic first:** balances, income and expense totals, budgets, and
   goal progress must be calculated by system logic.
2. **AI explains:** AI interprets calculated results and source-backed data.
3. **User confirms:** any AI-inferred data remains a suggestion until confirmed
   by the user.
4. **Traceable:** answers show the time range, accounts, and transactions used.
5. **Correctable:** users can always correct results, and that feedback can
   improve future suggestions.

## 7. Use Cases

### UC-01 — Set Up an Initial Financial Profile

**Goal:** create a useful financial overview without requiring excessive
configuration.

**Main flow:**

1. The user creates an account.
2. The user selects a currency and the start date of their financial cycle.
3. The user adds accounts such as cash, bank accounts, or digital wallets,
   including their opening balances.
4. The user provides income sources, recurring expenses, and one priority goal.
5. FinCent creates an initial overview and explains which data is still
   missing.

**Outcome:** the user can see their total balance, upcoming obligations, and
initial Safe-to-Spend amount.

### UC-02 — Record a Transaction Manually

**Example:** the user enters an amount, income or expense type, category,
account, date, and note.

**Requirements:**

- common transactions must take only a few steps;
- users can create custom categories;
- balances and related metrics update immediately after saving;
- users can edit, delete, and create a similar transaction.

### UC-03 — Record a Transaction Using Natural Language

**Example input:** “Took a Grab ride last night, 82k paid with Momo.”

**Main flow:**

1. AI extracts the amount, time, account, description, and suggested category.
2. The system displays a preview.
3. The user confirms or corrects the data.
4. The transaction is saved, and the correction is recorded to improve future
   suggestions.

**Exception:** if the amount is missing or the account cannot be identified,
the system must ask the user instead of guessing.

### UC-04 — View Today's Financial Overview

The dashboard should prioritize decisions, not the number of charts.

The user needs to see:

- total balance by account;
- income, expenses, and net cash flow for the current period;
- Safe-to-Spend until the next income date;
- upcoming bills or recurring expenses;
- budgets at risk of being exceeded;
- progress toward the priority goal;
- the one to three most important insights.

### UC-05 — Manage Budgets

1. The user defines a limit for a category or spending group.
2. FinCent displays the amount spent, amount remaining, and spending pace.
3. The system forecasts the likelihood of exceeding the budget based on the
   days remaining.
4. When a risk is detected, FinCent warns the user and recommends a maximum
   spending amount for the rest of the period.

### UC-06 — Manage Recurring Transactions and Bills

- create recurring income or expense schedules;
- remind the user before a due date;
- include projected transactions in cash-flow calculations;
- request confirmation when a transaction actually occurs;
- warn the user if the projected balance is insufficient.

### UC-07 — Track a Financial Goal

1. The user enters a target amount and deadline.
2. FinCent proposes a contribution amount based on available cash flow.
3. The user chooses a plan.
4. The system tracks progress, sends contribution reminders, and recalculates
   the plan when circumstances change.
5. If the user falls behind, FinCent offers options: increase contributions,
   extend the deadline, or reduce the target.

### UC-08 — Ask the AI Assistant

**Example questions:**

- “Where did I spend more this month than last month?”
- “Can I afford to buy a $700 phone in October?”
- “If I want a $3,000 emergency fund within one year, how much should I save
  each month?”
- “Which expenses could I reduce with the least impact?”

**Response structure:**

1. a direct answer;
2. the figures and assumptions used;
3. relevant data or transactions;
4. one recommended action;
5. a warning when data is insufficient or the result is only an estimate.

### UC-09 — Detect Anomalies

FinCent detects cases such as:

- an expense significantly larger than the user's normal behavior;
- a category growing rapidly compared with the previous period;
- a potentially duplicated transaction;
- a change in the amount of a recurring bill;
- an actual balance that does not match the system balance.

The system only flags the issue and asks the user to review it. It does not
automatically delete or modify transactions.

### UC-10 — Receive Periodic Reports and Reviews

Every week or month, the user receives:

- total income, total expenses, and net cash flow;
- notable changes compared with the previous period;
- budgets met or exceeded;
- goal progress;
- unusual transactions;
- no more than three priority actions for the next period.

### UC-11 — Manage Personal Data

Users can:

- export transactions in a common format;
- view and edit their history;
- control whether their data can be used by AI;
- delete their account and data;
- view the history of important changes.

## 8. Proposed MVP Scope

### Required — P0

- registration, authentication, and user profiles;
- financial account and balance management;
- income and expense transaction CRUD;
- default and custom categories;
- natural-language transaction entry with a confirmation step;
- monthly overview dashboard;
- category-based budgets;
- recurring transactions, bills, and reminders;
- one savings goal;
- Safe-to-Spend with a transparent formula;
- basic AI insights based on transaction data;
- data export and account deletion.

### Recommended After P0 Is Stable — P1

- AI question answering based on personal data;
- multiple goals and priority recommendations;
- advanced anomaly detection;
- transaction import from CSV files or receipt images;
- multichannel notifications;
- personalized weekly and monthly reports.

### Later — P2

- direct bank and digital wallet synchronization;
- family accounts, shared budgets, and permissions;
- advanced debt management;
- investment portfolios and real-time asset values;
- long-term cash-flow forecasting;
- payment or transfer automation.

### Out of Scope for the MVP

- stock or cryptocurrency trading advice;
- credit scoring;
- tax filing or business accounting;
- lending, custody, or execution of financial transactions;
- a financial social network.

## 9. Conceptual Safe-to-Spend Formula

For the MVP, Safe-to-Spend can be defined as:

```text
Safe-to-Spend =
  Current available balance
  + Confirmed remaining income for the period
  - Remaining bills and essential expenses
  - Committed goal contributions
  - Minimum safety buffer
```

The result must include:

- the applicable time period;
- items included in or excluded from the calculation;
- confidence level for expected income;
- a warning if data is incomplete;
- the ability to inspect the calculation details.

This is an **estimate that supports decision-making**, not a promise that the
user can safely spend the entire amount under all circumstances.

## 10. Core User Journeys

### First-Time Experience

```text
Register
→ Add accounts and balances
→ Define recurring income and expenses
→ Set one goal
→ Receive an overview and Safe-to-Spend amount
→ Record the first transaction
```

### Daily Use

```text
A transaction occurs
→ Enter it manually or in natural language
→ Confirm the suggestion
→ Metrics update
→ Receive an alert only when action is required
```

### Periodic Review

```text
Receive a summary
→ Understand the most important changes
→ Inspect causes at the transaction level
→ Select one action
→ Adjust a budget or goal
```

## 11. Success Metrics

### Proposed North Star Metric

**The number of weekly active users with sufficient data who complete at least
one meaningful financial check-in.**

A meaningful check-in occurs when a user reviews their financial position and
performs at least one action such as:

- recording or confirming a transaction;
- inspecting the details of an insight;
- adjusting a budget;
- confirming a bill;
- contributing to or updating a goal.

### Supporting Metrics

- onboarding completion rate;
- time to first transaction;
- number of days with recorded transactions per week;
- percentage of AI-created transaction drafts confirmed without correction;
- 7-day and 30-day retention;
- percentage of users who act on alerts;
- percentage of users whose data remains reconciled with actual balances;
- percentage of users who stay within budgets or progress toward goals each
  month.

The number of questions sent to AI should not be treated as the primary success
metric. AI creates value only when it improves data accuracy or leads to better
decisions.

## 12. Product Risks and Controls

| Risk | Impact | Control |
| --- | --- | --- |
| Users stop recording transactions | Data and insights lose value | Fast entry, recurring templates, appropriate reminders, and data import |
| AI categorizes transactions incorrectly | Loss of trust and inaccurate reports | Preview, confirmation, easy correction, and learning from feedback |
| AI fabricates or over-infers | Incorrect financial decisions | Deterministic calculations, source references, and explicit assumptions |
| Safe-to-Spend is misunderstood | Users spend beyond their means | Transparent formula, safety buffer, and incomplete-data warnings |
| Too many alerts | Users disable notifications | Impact-based prioritization and alert frequency limits |
| MVP scope becomes too broad | Delayed launch and difficult validation | Focus on employed users and daily income and expense flows |
| Financial data is exposed | Severe user harm | Data minimization, encryption, authorization, and audit logs |

## 13. Assumptions to Validate Before Significant Development

1. Target users are willing to record transactions if each entry takes only a
   few seconds.
2. “How much can I still spend?” provides more recurring value than a
   traditional reporting dashboard.
3. Users accept AI categorization when confirmation and correction are always
   available.
4. A flexible savings plan is more motivating than a goal that displays only a
   completion percentage.
5. Users are willing to provide financial data when privacy and AI data usage
   are clearly explained.

### Proposed Validation Methods

- interview 8–12 people from the target segment;
- ask them to describe how they managed money during the last 30 days;
- test a prototype for three tasks: recording a transaction, checking
  Safe-to-Spend, and responding to a budget alert;
- run a concierge test by manually generating insights from sample data and
  measuring whether users understand and act on them;
- prioritize AI automation only after the corresponding manual task has proven
  valuable.

## 14. Product Decisions to Make Next

Before moving to system design, answer the following questions:

1. Will FinCent launch as a responsive web application, a PWA, or a native
   mobile application?
2. Will the MVP support only VND and the Vietnamese market, or multiple
   currencies?
3. Will budget cycles follow calendar months or a configurable payday?
4. Will initial transaction data come from manual entry, CSV import, receipt
   images, or a combination?
5. How will Safe-to-Spend handle credit cards and debt?
6. Will AI insights run on demand or be generated periodically?
7. What policies will govern data retention, deletion, and transmission to AI
   providers?
8. What is the intended business model: free, freemium, or subscription?

## 15. Readiness Criteria for Product Design and Engineering

This product foundation is ready to advance when:

- the initial user segment has been confirmed;
- the three most important MVP problems have been selected;
- the USP and boundaries of AI have been agreed upon;
- the list of P0 use cases has been finalized;
- transaction entry and Safe-to-Spend flows have been validated with real
  users;
- the minimum required data and security principles have been defined;
- the metric used to evaluate the MVP has been agreed upon.

The following documents should then be created:

1. detailed MVP product requirements document;
2. user flows and information architecture;
3. domain model and data model;
4. system architecture;
5. milestone-based release plan.
