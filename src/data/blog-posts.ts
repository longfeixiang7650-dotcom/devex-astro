export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  category: string;
  readTime: number;
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
{
    slug: "top-10-ci-cd-tools-2026",
    title: "Running CI/CD as a Solo Developer: What I Use and What I Dropped in 2026",
    excerpt: "After several years drifting between CI systems, I settled on GitHub Actions for my own projects, dropped Jenkins, and stopped paying for hosted CI I never fully used. The honest reasons why.",
    content: `
# Running CI/CD as a Solo Developer: What I Use and What I Dropped in 2026

The short version: I am not running pipelines for a team. I am one person maintaining a handful of small projects, and every one of them has CI anyway. After several years of drifting between systems, I have settled on GitHub Actions for almost everything, dropped Jenkins entirely, and stopped paying for hosted CI that I never used to its full capacity. This post is the honest version of how I got there, including the parts where I wasted time.

## Why a Solo Developer Needs CI at All

It is easy to assume CI is an enterprise thing, something you adopt when you have merge queues and release trains. That assumption cost me a real bug. A couple of years ago I shipped a change to one of my projects that worked on my machine and broke in production because I had an environment variable set locally that did not exist on the server. It took me an afternoon to trace, and the whole time I was thinking: a two-minute CI run would have caught this.

Since then every project I start gets a pipeline on day one. Not a fancy one. Usually it does three things: install dependencies, run the test suite, and run a build. That is enough to catch the class of failure that only shows up on a clean machine. For the projects that deploy automatically, CI also does the deploy, which means I stop doing manual git-pull-and-restart dances on my VPS.

## What I Actually Need, in Order

Before I list tools, here is my real checklist, because it drives every decision below:

1. Zero cost for public repositories, and near-zero for private ones. I do not make money from most of these projects, so a CI bill is pure overhead.
2. A fast debug loop. When a pipeline fails, I want to see why in seconds, not wait in a queue.
3. No server I have to patch and babysit. Self-hosting runners is fine occasionally, but I do not want it to be my default.
4. Configuration I can read six months later. CI config is not code I touch daily, and a DSL I forget is worse than a slightly verbose YAML.

Every tool below gets judged against those four lines, not against feature count.

## GitHub Actions: Where I Landed

This is my default now, and it is boring in the best way. The free tier for public repositories is effectively unlimited, which means my open-source projects cost nothing to build. For private repos the included minutes have always been enough for the scale I work at, though I keep an eye on it.

The syntax took me an evening to learn. A workflow is a YAML file with triggers, jobs, and steps, and the mental model maps cleanly onto what actually happens. The marketplace of pre-built actions is the real reason I stay: checkout, setup-node, cache, and the various deploy actions mean I rarely write a step from scratch. I can wire up a new project in under ten minutes.

The parts I dislike are real, though. Debugging is the worst of it: you cannot run a workflow locally without a third-party tool, so a typo means pushing a commit and waiting for the run. When I was learning, I burned a handful of commits on nothing but YAML indentation errors. Complex workflows also get ugly fast. Once you nest matrix strategies inside reusable workflows with conditional jobs, the YAML stops being something a human can skim, and I have had to refactor workflows I wrote myself six months earlier because I could not follow my own logic.

One specific pain point: macOS runners are not free and are metered separately, which matters if you build desktop apps. I mostly build web projects, so this does not bite me often, but it is the first thing that pushes people off the platform.

## GitLab CI: The One I Used on a Client Project

I have run GitLab CI for someone else's project and came away genuinely impressed with parts of it. The built-in container registry is the standout feature: images built in one job are available to the next without any external registry setup, which makes multi-stage pipelines cleaner than the GitHub equivalent. The pipeline visualization in the UI is also nicer, which helps when you are explaining a failure to a non-technical stakeholder.

The downside is the syntax. GitLab CI has its own vocabulary (stages, needs, rules, extends) that does not map one-to-one onto anything else, and the documentation, while thorough, is dense. If you live in GitLab it is great. If, like me, your day-to-day is GitHub, the mental context switch is a real cost, and it was the main reason I did not adopt it for my own work.

I should note GitLab's free tier is generous, and if I were starting a project that needed to self-host the whole stack, GitLab's all-in-one nature (repo plus CI plus registry) would be genuinely tempting. For my situation, the friction of a second platform was not worth it.

## Jenkins: I Am Glad I Do Not Have to Run It Anymore

I used Jenkins years ago, back when it was the default answer, and I respect what it can do. It is the most flexible CI server ever built, and if your pipeline does something exotic, Jenkins plus a plugin probably handles it. The problem is the price of that flexibility: you run the server, you patch the server, you update plugins, and every so often two plugins decide they no longer like each other after an upgrade.

For a solo developer this is a bad trade. The moment I stopped having to maintain a Jenkins instance, I stopped wanting one. I mention it here mostly because it still shows up in comparison articles as a top choice, and for a solo developer in 2026 I think that advice is stale. Jenkins earns its keep on teams that need deep customization and have someone dedicated to operating it. That is not me.

## CircleCI and Buildkite: Evaluated, Not Adopted

CircleCI I actually used for a while, and its caching is the best I have encountered: builds genuinely get faster as the cache warms up, and the parallelization model is easy to reason about. What pushed me away was the free tier. Once I had a few projects, I was rationing minutes and occasionally hitting caps, and the jump to a paid plan was not justified by anything I was shipping.

Buildkite I only evaluated, never ran in anger. It is clearly aimed at teams that need their builds to run on their own infrastructure with strong audit trails, and for that it looks excellent. It is also priced for those teams. For a solo developer running web projects, it is overkill, and I say that as someone who likes the product.

## What My Pipelines Look Like Today

Here is the concrete stack I have settled on. Public projects run entirely on GitHub-hosted runners. One project, which needs a native dependency that is painful to compile fresh every run, uses a self-hosted runner on a small VPS I already paid for, and that has been stable for months with almost no maintenance. Deploys go either to Vercel or to my VPS over SSH, depending on the project.

The pattern I keep repeating is: lint and type-check first (fast feedback), then test, then build, and only deploy from the main branch. I do not do anything clever with caching beyond the standard actions, because at my scale the cleverness costs more than it saves.

## The Lesson I Would Pass On

If you are a solo developer choosing CI in 2026, ignore the feature comparison tables. The three things that actually matter are: how much it costs at your real scale, how fast you can debug a failed run, and whether you can read your own config three months later. Everything else is noise. For me, that answer is GitHub Actions, and the honest reason is not that it is the best tool in any single dimension, but that it is the one with the least friction on the platform I already live in.

*Updated June 2026. This reflects my own setup as an independent developer, not a paid evaluation of any vendor.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-05",
    category: "DevOps and Infrastructure",
    readTime: 10,
    tags: ["ci-cd", "devops", "github-actions", "gitops", "slsa", "developer-experience", "2026-tools"],
  },
  {
    slug: "docker-vs-podman-vs-orbstack-2026-developer-experience",
    title: "Docker, Podman, or OrbStack? What I Run Locally in 2026",
    excerpt: "I run Docker on servers and OrbStack on my Mac, and I gave Podman a real shot before moving on. How I actually choose a container engine in 2026.",
    content: `
# Docker, Podman, or OrbStack? What I Run Locally in 2026

The short version: I run Docker on Linux servers and OrbStack on my Mac, and I have mostly stopped using Podman after a genuine attempt to make it my default. That sentence sounds like a compromise, and it is. The container landscape in 2026 is less about which engine is technically superior and more about which one fits the machine you are sitting in front of.

## The Context: What I Actually Do with Containers

I do not run Kubernetes at home, and I do not orchestrate anything beyond a couple of compose files. My container use is modest and specific: I spin up databases for local development, I package a few small services for my VPS, and I build images that deploy to a container platform now and then. If your workload is a hundred-node production cluster, this post is not for you. If you are a developer who reaches for containers to make local setup less miserable, it is.

That modest scope is why I have come to care more about startup time, disk usage, and how well the thing integrates with my editor than about features like rootless mode or daemon architecture. Those engineering details matter, but they are not the axis I make decisions on.

## Docker: Still the Default, For Better and Worse

Docker is what everything else gets compared against, and for local development it mostly just works. Docker Compose is the reason: a single YAML file that defines a database plus an API plus whatever else, and a two-word command to bring it all up. Every tutorial, every README, and every colleague assumes Docker, which means the ecosystem gravity is enormous.

The cost is well documented at this point. On macOS, Docker Desktop runs a Linux VM under the hood, and that VM eats RAM. On an Intel Mac I watched Docker idle at several gigabytes, and even after trimming settings it was the single biggest memory consumer on the machine. The daemon model also means there is always something running in the background whether you are using it or not, and I have had more than one morning where my laptop battery drained faster than expected because Docker was quietly doing something.

On my Linux VPS, Docker is unambiguously fine. The daemon integrates with systemd, the overhead is lower, and there is no VM layer. If I only ever used Linux, I probably would never have gone looking for alternatives.

## Podman: The Alternative I Wanted to Love

Podman is the thing I tried hardest to switch to, because on paper it fixes exactly what annoys me about Docker. It is daemonless, so nothing runs in the background. It runs rootless by default, which is the right security posture. And the CLI is deliberately close to Docker's, to the point where you can alias docker to podman and barely notice.

In practice, on a Mac, it still needs a VM, and that is where the appeal thinned for me. The podman machine workflow adds a layer of management that Docker Desktop has polished away, and the integration with the rest of the ecosystem was, in my experience, just slightly off in ways that cost time. Tools that expected to talk to the Docker socket needed shims or extra flags. One of my projects uses docker compose features that podman-compose did not support cleanly, and I spent an evening chasing a networking difference that should not have been my problem.

On Linux, Podman is a different story, and if my daily driver were Linux I would seriously consider it. Rootless containers are the right default, and the absence of a background daemon genuinely simplifies operations. My honest take is that Podman is the better-engineered tool in a vacuum, but the vacuum is not where I work.

## OrbStack: The Mac Answer I Was Not Expecting

OrbStack is macOS-only, and it is the tool that finally stopped me from caring about the Docker-versus-Podman debate. It is a drop-in Docker replacement built natively on Apple's virtualization framework rather than a heavy VM, and the difference is immediate: containers start in under a couple of seconds, and idle memory usage is a fraction of what Docker Desktop was costing me.

What sold me, beyond the speed, is the small things. It exposes a filesystem integration so you can reach container files from the Finder, it spins up Linux machines as easily as containers, and it has a sensible built-in way to run things like Redis or Postgres without me hand-writing compose files. None of these are features I asked for. All of them are things I now use weekly.

The honest caveat is the same one that applies to any single-platform tool: it is a Mac thing, and my servers still run Docker. So I have not eliminated Docker from my life, I have just relocated it. For local work on a Mac, OrbStack is my default now, and I do not see myself going back.

## How I Actually Choose, in One Table

| Need | What I Use | Why |
| Local dev on Mac | OrbStack | Fast startup, low RAM, native integration |
| Servers and production | Docker | Ecosystem standard, systemd-native, well understood |
| Rootless/daemonless, on Linux | Podman | Better security posture, no background daemon |

## The Takeaway

The container engine wars that still flare up in comment sections are mostly irrelevant to a working developer. The correct answer is contextual: Docker where the ecosystem demands it, Podman where security posture is the priority and you are on Linux, and on a Mac, honestly, try OrbStack before you commit to anything. I stopped trying to have a single answer, and my setup got simpler as a result. The tool that disappears into the background and lets you get back to writing your application is the one you should keep.

*Updated June 2026. Written from my own daily use across a Mac laptop and Linux servers.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-06",
    category: "DevOps & Infrastructure",
    readTime: 8,
    tags: ["Docker", "Podman", "OrbStack", "Container Runtimes", "Developer Experience", "DevOps", "macOS Development", "G2 Reviews"],
  },
  {
    slug: "playwright-vs-cypress-vs-puppeteer-2026",
    title: "I Rewrote My E2E Tests in Playwright: What Broke and What Got Better",
    excerpt: "I migrated a project end-to-end tests from Cypress to Playwright last year. The tests got faster and more reliable, but two things genuinely broke along the way.",
    content: `
# I Rewrote My E2E Tests in Playwright: What Broke and What Got Better

The short version: I migrated a project's end-to-end tests from Cypress to Playwright last year, and it was the rare migration that went better than expected. The tests got faster, more reliable, and easier to debug. But it was not free, and there were two things that genuinely broke along the way. Here is the full accounting, including the parts I would do differently.

## Where I Started

My project had a Cypress suite that had grown to about forty test cases covering the main user flows: signup, login, a couple of CRUD screens, and the checkout path. It worked, mostly, but "mostly" was doing a lot of work there. The suite was flaky in ways I could never quite pin down, and I had developed a habit of re-running failed tests locally and assuming the failure was environmental rather than real. That habit is a red flag in hindsight: when you stop trusting your own test failures, the tests stop being useful.

The trigger for the migration was not ideology. It was a specific feature I needed: better handling of multiple browser contexts and the ability to test things across tabs and windows, which Cypress's architecture makes awkward by design. Once I accepted that limitation was not going away, the switch became a matter of when, not if.

## What I Did

I did not do a big-bang rewrite. I set up Playwright alongside Cypress, and I ported tests incrementally, a handful at a time, running both suites in CI until the new one caught up. That approach cost me a little longer in total, but it meant I was never without coverage for a feature I had already tested. If I could give one piece of advice here, it is this: do the parallel-run migration, even though it feels slower.

The port itself was mostly mechanical. Playwright's API is close enough to Cypress's that most tests translated line by line. Selectors needed the most attention. Cypress's default of CSS selectors worked, but I used the migration as an excuse to add data-testid attributes across the app, which turned out to be the single best decision in the whole project. Stable, semantic selectors beat fragile CSS chains every time, and I wish I had done that years earlier regardless of the framework.

## What Got Better

The speed improvement was immediate and dramatic. Playwright's auto-waiting model means you stop writing manual wait-for-element loops, and the tests genuinely run faster. The headless run went from something I avoided to something I run constantly. Debugging also improved: Playwright's trace viewer, which records a full timeline of the test including screenshots and network activity, has replaced the print-statement debugging I used to do in Cypress.

The reliability gain was the real payoff though. After the migration, the flaky failures that used to waste my afternoons mostly disappeared. A couple of genuinely intermittent failures remained, and those turned out to be real bugs in my app that the old suite had been masking with its flakiness. That is a sobering thought: for months I had been re-running tests that were actually catching real problems.

## What Broke

Two things, both worth knowing before you start.

The first was cross-origin handling. My app does a redirect through an authentication provider, and Cypress had handled that quietly. Playwright requires you to be explicit about navigating across origins, and until I understood that, a whole class of tests failed with errors that did not point to the real cause. Once I restructured the auth flow to run inside a single context, it was fine, but it took me an afternoon to diagnose.

The second was my own fault. I had a handful of Cypress tests that relied on the DOM being in a specific state at the exact moment of the assertion, which Cypress's implicit retries tolerated and Playwright's model surfaced as failures. Those tests were bad tests. Playwright forced me to write them properly, and the code is better for it, but it felt like breakage at the time.

## Where Cypress Still Wins

This is not a clean victory lap. Cypress has a genuinely better developer experience for people who are not building for every browser. Its interactive runner, where you click a test in a GUI and watch it step through, is still nicer than Playwright's. If your team is small, your app is Chrome-only, and nobody wants to learn a new API, Cypress remains a totally reasonable choice. I do not think choosing Cypress in 2026 is wrong. I think choosing it because it is what you have always used, without checking whether your needs have outgrown it, is the mistake.

## The Verdict

For my situation, Playwright was the right move. The speed, the trace-based debugging, and the multi-browser support all paid off within the first month. The migration cost me about two weeks of evenings, most of it on the cross-origin issue and the bad-tests cleanup, and I would spend it again. If you are sitting on a flaky Cypress suite and telling yourself it is fine, it is probably not fine, and the migration is less scary than you think.

*Written June 2026. This is a record of my own migration, not a paid comparison.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-07",
    category: "Testing & QA",
    readTime: 8,
    tags: ["playwright", "cypress", "puppeteer", "browser-testing", "e2e-testing", "test-automation"],
  },
  {
    slug: "grafana-vs-datadog-vs-new-relic-vs-sentry-2026",
    title: "Observability on a Small Budget: Grafana vs the Paid Suites",
    excerpt: "I have run both the paid observability suites and the open-source Grafana stack. For a small stack, the messy free option won, and here is the honest math.",
    content: `
# Observability on a Small Budget: Grafana vs the Paid Suites

The short version: I have spent real time on both sides of this fence, and my conclusion is unglamorous. If you are running a small stack and watching your costs, the open-source Grafana stack, messy as it is to assemble, will do the job. The paid suites like Datadog and New Relic are better products, but they are priced for teams whose observability spend is a rounding error, and that is not me.

## How I Got Into This

I did not set out to become an observability hobbyist. I had a small production service that started misbehaving under load, and my only signal was that CPU spiked and things slowed down. I had no idea which endpoint was slow, which query was heavy, or whether a third-party call was the culprit. I was debugging blind, and it was miserable.

So I started looking at options, which in practice means a fork in the road: pay for a hosted platform that gives you dashboards, alerting, and APM in one polished box, or assemble an open-source stack that does most of it for the cost of a server you already run. Both roads work. They lead to different places.

## The Paid Side: Datadog and New Relic

I ran Datadog on a project for a while, and it is genuinely the best observability product I have used. The setup is trivial: install one agent, and within minutes you have dashboards, traces, and logs all correlated with a shared trace ID. The UI is the killer feature. When something goes wrong, I could click from a slow request down to the exact database query and see the span that was eating the latency. That workflow is worth a lot when you are on call and tired.

The problem is the pricing model, which is usage-based and famously slippery. You pay for ingested metrics, for traces, for logs, and for retention, and the bill moves in ways that are hard to predict in advance. I watched a monthly bill climb as my traffic grew, and eventually the number crossed a line where I could no longer justify it for a side project that did not pay its own way. That is the honest reason I left, and it is a common one.

New Relic I used more briefly, and the experience was similar in shape: a strong product, an agent that is easy to install, and a pricing conversation that felt designed for enterprises. The free tier is more generous than Datadog's for small users, which is worth noting, but the jump to paid is steep, and the platform's breadth means there is a lot of surface area you are not using but are implicitly paying for.

## The Open-Source Side: Grafana, Prometheus, and Friends

The Grafana stack is the opposite in almost every way. It is free, which is the headline, but the real cost is your time. You assemble the pieces yourself: Prometheus for metrics, Loki for logs, Tempo for traces, and Grafana on top to visualize all of it. Nothing wires itself together, and the first time you set it up, expect to spend a weekend on configuration and to hit at least one networking issue that takes an hour to find.

Once it is running, though, it is quietly excellent. Grafana dashboards are the best in the business, and I genuinely prefer them to anything Datadog ships. The alerting is capable, the dashboards are infinitely customizable, and because everything is on a server I control, my cost is flat regardless of traffic. For a small service, that flat cost is the whole argument.

The honest downsides: the APM story is weaker than Datadog's, and the correlation across metrics, logs, and traces is not as seamless. You will build some of the glue yourself. And you are now operating your own monitoring infrastructure, which means when the monitoring breaks, nobody alerts you about it, because the thing that would alert you is the thing that broke.

## Sentry, Briefly

Sentry deserves its own mention because it is the one paid tool I kept even after cutting the others. It is error tracking rather than full observability, and it solves a narrower problem perfectly: when an exception happens in production, Sentry tells me exactly where, with a stack trace and the surrounding context. Its free tier has covered my needs, and it is the single tool that has caught the most real bugs for me. If you only have budget for one monitoring subscription, make it this one.

## What I Actually Run Now

My current setup is deliberately boring. Grafana, Prometheus, and Loki on the VPS I already had, plus Sentry for errors. I do not have traces wired up everywhere, and I accept that my APM is weaker than Datadog's would be. In exchange, my monitoring bill is zero, and I have the dashboards I actually need, which after all the tool-hopping is a small collection: request latency, error rate, CPU and memory, and a handful of business metrics.

## The Decision Framework

If you are choosing, the question is not which product is better. Datadog is better. The question is what you are optimizing for. If you are a funded team shipping a product that makes money, pay for Datadog and get your evenings back. If you are a solo developer or a small team where a monitoring bill is real money, assemble the Grafana stack, budget a weekend for setup, and add Sentry. Both are defensible. The only wrong move is running blind and pretending the next incident will be different from the last one.

*Written June 2026. Based on my own deployments; pricing and features change, so check current numbers before deciding.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-09",
    category: "DevOps & Infrastructure",
    readTime: 9,
    tags: ["observability", "developer experience", "monitoring", "Grafana", "Datadog", "New Relic", "Sentry"],
  },
  {
    slug: "best-devops-tools-2026-comparison",
    title: "The DevOps Tools I Actually Reach For (and the Ones I Dropped)",
    excerpt: "My DevOps stack has shrunk to about a dozen tools I actually trust, and I have dropped more than I have kept. What survived contact with real projects, and why.",
    content: `
# The DevOps Tools I Actually Reach For (and the Ones I Dropped)

The short version: after years of accumulating tools, my DevOps stack has shrunk to about a dozen things I actually trust, and I have dropped more than I have kept. This is not a best-of list. It is a record of what survived contact with real projects, and the reasons the others did not.

## The Filter I Apply to Every Tool

Before I list anything, here is the filter that removed most of my tooling. A DevOps tool earns a permanent place in my workflow only if it passes three tests. First, does it work for a single developer as well as it works for a team? A lot of enterprise tooling assumes a platform team exists to operate it, and for me that assumption is wrong. Second, does it keep working when I ignore it for a month? Tools that need constant attention get abandoned, because I do not have a quarter to spend on upkeep. Third, is the failure mode visible? When something breaks, I need to be able to see why without digging through three layers of abstraction.

Those three tests killed most of the tools I used to use.

## What I Kept: The Short List

Git for source control is not even a decision anymore, it is just there. GitHub is the host because everything else I use integrates with it first. For CI, GitHub Actions is my default, which I have written about separately, so I will not repeat the reasoning here beyond saying the free tier and the marketplace of actions are the whole argument.

For containers, Docker on servers and OrbStack locally. For observability, Grafana with Prometheus and Loki, plus Sentry for errors. For infrastructure, Terraform when I need cloud resources, and plain shell scripts when I do not. For secrets, a simple env-file approach plus platform secret stores, because I refuse to run a dedicated secrets manager for a handful of keys.

The theme across all of these is the same: each one is boring, each one has a large community, and each one works without me babysitting it. None of them is the flashiest option in its category. All of them are the ones I stopped thinking about after setup.

## What I Dropped, and Why

Jenkins was the first thing I dropped, years ago now, and I do not miss maintaining a server and a plugin ecosystem for one person's worth of pipelines. I wrote about that decision elsewhere, so I will not belabor it.

I dropped a dedicated infrastructure-as-code toolchain for my personal projects and went back to a mix of Terraform for real cloud work and scripts for everything else. The moment I admitted that I was not running a multi-cloud fleet, the whole elaborate setup stopped earning its keep.

I dropped a self-hosted monitoring stack once, briefly, when I decided the maintenance was not worth it, and then rebuilt it when I realized the paid alternative cost more than my time was worth. That back-and-forth taught me something useful: the right answer changes as your scale changes, and pretending otherwise is how you end up over-invested in either direction.

I dropped several niche utilities that I will not name, not because they were bad, but because I was the only person using them and every search for help turned up my own past questions. A tool with no community is a liability for a solo developer, however elegant it is.

## The Anti-Pattern I See Everywhere

The most common DevOps mistake I see, and one I made myself, is treating tool adoption as progress. Adding a new tool feels like you are improving your infrastructure, but every tool you add is another thing that can break, another thing to update, another thing to learn when you are already underwater. The real skill is subtraction: removing tools until what is left is only what you actually need.

For a while I had a dashboard that nobody looked at, a deployment system with more stages than my projects had services, and a monitoring setup alerting on metrics I never acted on. All of it was overhead dressed up as maturity. Stripping it back was the single most productive thing I did for my own workflow.

## The Practical Takeaway

If you are building out your own stack, start from the job you actually need done, not from the tools other people list. You need your code versioned, tested, deployed, and watched. That is four jobs. Pick the simplest tool for each, use it for a month, and only add complexity when a real pain shows up. The best DevOps stack is the smallest one that reliably does the four jobs, and everything else is a hobby.

*Written June 2026. This reflects my own setup and preferences as an independent developer, not a vendor comparison.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-10",
    category: "DevOps & Infrastructure",
    readTime: 8,
    tags: ["DevOps tools", "CI/CD", "GitOps", "2026 tools", "developer experience"],
  },


  {
    slug: "github-actions-vs-gitlab-ci-vs-jenkins-2026",
    title: "Three CI Systems Later: GitHub Actions, GitLab CI, and Jenkins From the Trenches",
    excerpt: "I have run real pipelines on GitHub Actions, GitLab CI, and Jenkins at different points. They are more different in practice than their feature lists suggest.",
    content: `
# Three CI Systems Later: GitHub Actions, GitLab CI, and Jenkins From the Trenches

The short version: I have run real pipelines on all three of these systems at different points, and they are more different in practice than their feature lists suggest. GitHub Actions is where I ended up, but each one earned its keep in a specific situation, and each one has a failure mode that only shows up after you have been using it for a while.

## Where Each One Actually Comes From

Jenkins is the oldest and the most honest about what it is: a build server you run and configure yourself. Its strength and its weakness are the same thing. It does whatever you tell it, through a plugin system that covers nearly every imaginable integration, but you are the one who has to tell it, and you are the one who has to keep the whole machine running.

GitLab CI is built into GitLab, and you can feel that in how tightly the pipeline is woven into the rest of the product. Merge requests, the container registry, environments, and the pipeline are all one system, which is genuinely pleasant if you live in GitLab.

GitHub Actions is the same idea on GitHub's side: a CI system that is not a separate product but a feature of the platform you already use. Its real advantage is the marketplace of pre-built actions and the sheer volume of examples online, because it has become the default for a large chunk of the industry.

## Jenkins: The One I Am Glad I No Longer Run

I ran Jenkins years ago, and I respected it the way you respect an old truck that can haul anything but needs constant maintenance. The plugin model means there is almost nothing Jenkins cannot do, but every plugin is another thing to update, and every update is a chance for two plugins to stop agreeing with each other. The declarative pipeline syntax that came later made things better, but it arrived after I had already internalized the older, messier ways of doing things.

The honest assessment is that Jenkins still makes sense for teams that need deep customization or that must run everything on their own infrastructure with no external dependency. It does not make sense for a solo developer or a small team that wants CI to be a solved problem rather than a side job. I do not run it anymore, and I would not go back unless a project genuinely forced me to.

## GitLab CI: The Best All-in-One I Have Used

The period where I ran GitLab CI was on a client project, and it was the most coherent CI experience I have had. Everything lives in one place, the container registry means images flow between jobs without ceremony, and the pipeline visualization is better than anything GitHub offers. If I were building a project from scratch and wanted the whole DevOps surface in one product, GitLab would be my answer.

The reason I did not adopt it for my own work is simple and a little embarrassing: my own projects live on GitHub, and I did not want to maintain two platforms. The mental overhead of remembering which syntax belonged to which system was real, and it was not worth it for projects that only I maintain. That is not a criticism of GitLab, it is a criticism of my own context, and it is the kind of honest reason that rarely shows up in feature comparisons.

## GitHub Actions: Where I Ended Up

I keep coming back to GitHub Actions for reasons that are more about friction than features. The free tier for public repositories is effectively unlimited, which matters when most of my projects are open source. The marketplace means I rarely write a step from scratch. And because so many other people use it, the answer to almost any problem is already written down somewhere.

Its failure modes are worth naming, because they do not show up until you are in deep. Debugging is slow: you cannot run a workflow locally without third-party tooling, so a typo costs a commit and a wait. Complex workflows turn into YAML that is hard for a human to read, and I have refactored my own workflows because I could not follow the logic I wrote months earlier. And the macOS and larger runner tiers are metered separately, which is the first thing that pushes people off if they build native desktop software.

## How I Would Choose Today

The decision is not really about which system has the most features. It is about which platform you already live in and what you are optimizing for. If you are on GitHub, GitHub Actions is the path of least resistance and a genuinely good system. If you want one product for everything and you are comfortable with GitLab's syntax, GitLab CI is excellent and arguably more coherent. If you need total control and you have someone to operate it, Jenkins will do anything you ask. The only wrong choice is to pick based on a comparison table instead of your own situation, because the table will not tell you which one you will still be happy with six months later.

*Written June 2026. Based on my own use of all three systems over several years.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-11",
    category: "DevOps & Infrastructure",
    readTime: 8,
    tags: ["github-actions", "gitlab-ci-cd", "jenkins", "ci-cd", "devops", "developer-experience"],
  },


  {
    slug: "ai-assisted-code-review-tools-2026-comparison",
    title: "AI Code Review Tools: What They Catch and What They Miss",
    excerpt: "AI code review catches typos and API misuse with impressive reliability, but it misses the architectural mistakes that actually cost you months. How I use it as a first reviewer.",
    content: `
# AI Code Review Tools: What They Catch and What They Miss

The short version: I have run AI code review tools on my own pull requests for a while now, and my conclusion is that they are genuinely useful for a narrow slice of problems and nearly useless for the rest. They catch typos, subtle API misuse, and obvious logic errors with impressive reliability. They do not catch the architectural mistakes that actually cost you months. Treat them as a fast first reviewer, not as a substitute for a human.

## What Got Me Curious

I started using AI code review because I am a solo developer, which means I am the only reviewer of my own code, and self-review is famously unreliable. You read what you meant to write, not what you actually wrote. I wanted a second set of eyes that was cheap and always available, and AI review tools promised exactly that: a reviewer that never gets tired and never has to context-switch.

The first thing I learned is that the category is more varied than I expected. Some tools are linters that grew up, adding a language model on top of static analysis. Some are models trained to read diffs and write comments. Some are assistants that review as you code rather than at the pull request stage. They are not interchangeable, and the differences matter more than the marketing suggests.

## What They Are Genuinely Good At

The reliable wins are the small, mechanical ones. A tool flagged a variable I had shadowed in a nested scope, which would have caused a subtle bug that no test caught. Another caught that I was using an API the wrong way, with a one-line explanation of the correct signature and a link to the docs. Another pointed out a condition that could never be true, which meant a whole code path was dead and I had not noticed.

These findings are valuable precisely because they are boring. They are the kind of thing a careful human reviewer would catch eventually, but the AI catches them instantly and consistently, and it does not get tired after reviewing ten files. For a solo developer, that is a real upgrade. The signal-to-noise ratio on this kind of finding is high: when the tool flags something in this category, it is almost always right.

## Where They Start to Struggle

Beyond the mechanical stuff, the value drops off fast. The tools are bad at judging whether a piece of code is the right shape for the problem, which is the actual hard part of review. They will happily approve a function that works but is structured wrong, because the model can verify syntax and even behavior without understanding the design intent. A human reviewer would ask why you are doing it this way at all. The AI mostly does not.

They also generate false confidence. I have had a tool reassure me that a change was safe when it was not, because the model reasoned about the code in a way that sounded plausible but missed a real edge case. That is the dangerous failure mode: not the tool being wrong, but the tool being wrong in a way that sounds authoritative, so you skip the check you would have done anyway.

## The Context Problem

The deeper limitation is context. A pull request review only has the diff to work with, and the diff is a tiny window into a system that has history, constraints, and intent that live in your head and in the rest of the codebase. The tools I have tried do not reliably connect a change to the conventions established elsewhere in the project, or to the reason a thing was built the way it was. When they do flag a real issue, they often cannot tell you why it matters in this specific codebase, which is most of what a senior reviewer actually contributes.

## How I Use Them Now

I have settled into a workflow that gets the value without the false comfort. AI review runs as a first pass on every pull request, and I treat its mechanical findings as gospel: if it flags a shadowed variable or an API misuse, I fix it without arguing. Its higher-level opinions I read and then mostly ignore, because they are as likely to be noise as signal. The final review is still me, or a human collaborator when there is one, because that is the only reviewer who understands what the code is for.

The one place I lean on it hardest is security-sensitive changes, where the stakes of a missed edge case are high and the tool's exhaustive checking is a cheap second pass. Even there, I treat it as a filter, not a guarantee.

## The Verdict

AI code review is a genuinely useful tool that is easy to overrate. It will save you from a class of small mistakes you would otherwise ship, and that is worth having. It will not save you from the big ones, and the biggest risk is convincing yourself it will. Use it as the first reviewer, keep a human as the last, and you will get most of the benefit without the false confidence.

*Written June 2026. Based on my own use of several AI review tools across my projects.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-12",
    category: "Code Review / AI Tools",
    readTime: 8,
    tags: ["AI Code Review", "GitHub Copilot", "CodeRabbit", "Graphite", "SonarQube", "Reviewpad", "developer experience", "DevEx", "code quality", "PR workflow"],
  },
  {
    slug: "code-quality-tools-2026-comparison",
    title: "Keeping a Small Codebase Clean: The Lint and Quality Stack I Settled On",
    excerpt: "I spent years accumulating linters, formatters, and quality gates, then spent an afternoon deleting most of them. The small stack that actually catches real problems.",
    content: `
# Keeping a Small Codebase Clean: The Lint and Quality Stack I Settled On

The short version: code quality tooling, like a lot of developer tooling, is easy to over-engineer. I spent years accumulating linters, formatters, and quality gates, and then I spent a pleasant afternoon deleting most of them. What remains is a small stack that catches real problems and stays out of my way, and that is the whole point.

## The Trap I Fell Into

The trap is that every quality tool sounds reasonable on its own. A linter catches bugs. A formatter keeps style consistent. A complexity analyzer flags functions that got too big. A security scanner finds vulnerable dependencies. Each one is defensible, so you add them all, and then one day you have a build pipeline with seven quality stages and a pre-commit hook that takes a minute to run, and you still ship the same bugs.

I know because I built that exact thing. The pre-commit hook was the moment I realized I had gone too far. It was checking the same things the CI pipeline checked, just slower, and it made every commit feel like a small production incident. When a tool is making you dread your own workflow, it has stopped helping.

## What Actually Matters, in Order

After the purge, I ranked what I actually needed from code quality tooling, and the list came out shorter than I expected.

Formatting comes first, and it is not close. A formatter removes an entire category of discussion and diff noise. I use Prettier for anything it supports, and I stopped thinking about style the day I adopted it. The value is not the style itself, it is that nobody, including me, has to have an opinion about it anymore.

Linting comes second. ESLint with a reasonable ruleset catches the kind of real mistake that formatting cannot: unused variables, references to things that do not exist, dangerous patterns. I keep the ruleset conservative. Every lint rule that produces more false positives than fixes gets removed, because a linter that cries wolf trains you to ignore it.

Type checking comes third, and for TypeScript projects this is quietly the biggest bug-catcher of all. A surprising number of my bugs are the kind a compiler would have caught if I had not been writing untyped code. Moving my projects to TypeScript, or adding strict mode where it already was, eliminated a whole class of runtime error before it could exist.

Everything else, the complexity metrics and the coverage gates and the custom rules, I dropped. They were measuring things I did not act on.

## The Setups That Survived

My projects now share roughly the same small config. Prettier for formatting, ESLint for linting, and TypeScript strict mode where applicable, all wired into the same pre-commit hook and the same CI step. The hook runs in well under a second now, which means I actually let it run instead of skipping it.

The config files are deliberately minimal. I use a popular shared ESLint config as a base and override only what I need, which means I inherit fixes from the community instead of maintaining my own ruleset. That was the other lesson: the less custom config you own, the less you have to keep working when the ecosystem moves.

## Where the Line Is

There is a real difference between tooling that prevents bugs and tooling that measures your code's self-esteem. Coverage percentages, complexity scores, and most custom lint rules fall into the second bucket for a small project. They feel productive, but they are mostly a way to feel busy.

The test I now apply to any proposed quality tool is simple: what specific bug has it actually caught in my code, and would I have caught it another way? If the answer is vague, the tool does not earn a place. The stack that remains is small, fast, and boring, and it catches the bugs that actually happen to me. That is all I ever wanted from it.

*Written June 2026. This reflects the tooling I actually run on my own projects.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-13",
    category: "Code Quality / DevTools",
    readTime: 8,
    tags: ["code-quality", "sonarqube", "eslint", "prettier", "biome", "semgrep", "trivy", "static-analysis", "developer-experience", "2026-tools"],
  },
  {
    slug: "the-rise-of-developer-experience-engineering-2026",
    title: "Developer Experience Isn't a Buzzword: What Improving DX Actually Looks Like",
    excerpt: "Developer experience felt like a buzzword until I spent real effort on my own setup. What removing friction actually looked like, concrete and unglamorous.",
    content: `
# Developer Experience Isn't a Buzzword: What Improving DX Actually Looks Like

The short version: developer experience has become a buzzword, and I understand the eye-roll, because for a long time it felt like a term invented to sell internal tools. But after spending real effort on my own development setup, I have come around: DX is just the name we gave to the observation that how fast you can move depends on how much friction your tools add, and removing that friction is one of the highest-leverage things you can do. Here is what that actually looked like for me, concrete and unglamorous.

## The Moment I Noticed

I noticed it on a day when I made one small change to a project and spent forty minutes getting it running. The change was trivial. The forty minutes was spent reinstalling dependencies, waiting for a build, waiting for tests, and fighting a local environment that had drifted from what CI expected. The actual code took five minutes. The other thirty-five were pure friction.

That is the definition I have settled on for developer experience: the distance between wanting to make a change and having it verified. Everything that stretches that distance is DX debt, and almost none of it is the kind of thing you would call a bug. It is just friction, accumulated quietly.

## What I Actually Changed

The fixes I made were not glamorous. I did not build an internal platform or adopt any new framework. I did four small things that together changed my daily experience more than any tool purchase ever has.

First, I made the local setup deterministic. The project's environment had drifted, so a fresh clone would not run without undocumented manual steps. I pinned the dependencies, added a setup script that did the whole thing in one command, and deleted the parts of the README that were wrong. The first run after a clone went from an afternoon of archaeology to about ten minutes.

Second, I got the build and test loop fast enough that I stopped context-switching while I waited. The build was taking long enough that I would go check something else and come back ten minutes later having forgotten what I was doing. Cutting that time down, mostly by removing work the build did not need to do, meant I stayed in the flow of the change I was making.

Third, I made the failure messages readable. This was the cheapest and most valuable change. When a test failed, the output used to be a wall of text that took real effort to parse. Reorganizing the output so the actual assertion and the relevant values were visible at a glance meant I went from dreading test failures to actually trusting them.

Fourth, I documented the things I kept forgetting. Not a big documentation project, just a file of the commands and gotchas that had cost me time more than once. The bar for writing something down became: if I have looked this up twice, it goes in the file.

## What I Did Not Do

Just as important is what I deliberately did not do. I did not automate everything, because automating a task I do once a month costs more than the task itself. I did not chase a zero-config setup, because the config that exists is there for a reason. And I did not treat developer experience as a project with a roadmap and a deadline, because the minute it becomes a project, it becomes another thing competing for the time it was supposed to save.

The goal was never to eliminate friction entirely, which is impossible and also a trap. The goal was to get the friction low enough that it stopped being the thing I thought about, so I could think about the actual work.

## What I Learned

The biggest lesson is that developer experience is mostly subtraction. It is not about adding tools, it is about finding the points where your workflow forces you to wait or to guess, and removing them one at a time. The tools are usually already there. The problem is that they are misconfigured, or undocumented, or doing work nobody needs.

The second lesson is that you cannot fix what you do not notice. Friction is invisible precisely because you live inside it, and the only way to see it is to pay attention to the moments when you are annoyed or waiting and ask what, specifically, is causing it. For me, the forty-minute afternoon was the wake-up call, and the fixes that followed were the best return on effort I have gotten from any tooling change in years.

*Written June 2026. This is my own experience improving my development setup, not a product pitch.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-14",
    category: "DevEx / Platform Engineering",
    readTime: 8,
    tags: ["developer-experience", "devex", "platform-engineering", "inner-loop", "cognitive-load", "ci-cd", "developer-productivity", "golden-paths", "devops", "2026-trends"],
  },
{
    slug: "top-10-ai-assisted-coding-tools-2026",
    title: "Four AI Coding Assistants, Three Months: Cursor, Copilot, Windsurf, and Continue",
    excerpt: "I spent three months using four AI coding assistants on real projects. They are not nearly as interchangeable as the hype suggests, and here is where each one actually shines.",
    content: `
# Four AI Coding Assistants, Three Months: Cursor, Copilot, Windsurf, and Continue

The short version: I spent about three months using four different AI coding assistants across my own projects, and they are not nearly as interchangeable as the hype suggests. Cursor won my day-to-day workflow, Copilot is the safe default I would recommend to most people, Windsurf has a genuinely good idea in its agent mode, and Continue is the open-source option that is better than it has any right to be. The details below are the reasons, including the parts that annoyed me.

## Why I Did This

I did not set out to write a comparison. I set out to find one tool to use every day, and the only way to do that honestly was to actually use each one for a few weeks instead of reading about them. My bar was simple: does the tool make me faster on real code, and does the help stay useful when the task stops being a demo?

The four I picked are the ones people actually ask about: GitHub Copilot because it is the incumbent, Cursor because it is the one my developer friends kept mentioning, Windsurf because its agent mode gets a lot of attention, and Continue because I wanted to see what the open-source path looked like.

## GitHub Copilot: The Safe Default

Copilot is the tool I would recommend to someone who does not want to think about this at all. It plugs into your editor, it autocompletes inline, and it does that one thing well. The completions are fast and mostly sensible, and when they are wrong, they are wrong in a way that is easy to ignore, which is its own kind of virtue. A tool that occasionally inserts nonsense is fine. A tool that occasionally inserts nonsense and makes you trust it is not.

The thing Copilot does not do well, at least in my use, is the multi-file, agent-style work. It is a completion engine, and its chat features feel bolted on rather than designed. If your workflow is mostly writing code line by line with occasional suggestions, Copilot is great. If you want an assistant that can take a task and run with it across several files, you will hit its ceiling quickly.

## Cursor: Where I Ended Up

Cursor is the one I kept, and the reason is that its model of the whole codebase is noticeably better. When I ask it to do something that touches multiple files, it usually understands the existing structure instead of guessing at it. That makes the difference between an assistant that feels like autocomplete and one that feels like a pair programmer who has actually read your code.

The agent mode is the feature that sold me. You describe a change, it plans the edits, and it can apply them across files, running tests as it goes. It is not magic, and I still review everything it writes, but the loop of describe, apply, verify is genuinely faster than doing it by hand for the kind of mechanical multi-file change that used to eat an afternoon.

My complaints are real. The UI is more complex than Copilot's, and there is a learning curve before you stop fighting it. The pricing is higher than I would like for a hobby project. And the agent can be overconfident, making a sweeping change when a smaller one would do, which means you have to watch it. But on balance it is the tool that changed my workflow the most.

## Windsurf: The Good Idea

Windsurf's agent mode is the thing that stood out. The idea is that instead of you steering the assistant through a chat, the agent works more autonomously through a task, and when it works, it feels closer to delegating than to pairing. There were moments where I gave it a task and it genuinely handled the whole thing, including running the build and fixing the failures it caused.

The problem was consistency. The agent mode would be brilliant one day and wander off the next, making changes that did not relate to what I asked. For a solo developer, that unreliability is expensive, because reviewing an agent's work is not free, and if you cannot predict when it will go off the rails, you end up reviewing everything as carefully as if you had done it yourself. I liked the direction a lot. I just did not trust it enough to rely on.

## Continue: The Open-Source Surprise

Continue is the one I had the lowest expectations for and was most pleasantly surprised by. It is an open-source assistant that you wire up to whatever model you want, including models you run locally or through your own API keys. That control is its whole appeal: you are not tied to one vendor, and the data story is whatever you make it.

In daily use, it felt like a slightly less polished Copilot, and that is honestly a compliment given that it is free and open source. The setup is more involved, and the out-of-the-box experience is rougher, but once it is running, the completion quality is fine. For someone who cares about keeping control over their models or their code, it is a legitimate choice rather than a compromise.

## How I Would Choose

The honest recommendation depends on what you optimize for. If you want the lowest-friction default and do not care about the vendor, take Copilot. If you want the tool that understands your codebase best and are willing to pay for it, take Cursor. If you want to watch the agent-based approach evolve, Windsurf is the one to try, just do not trust it blindly yet. And if control over your models matters to you, Continue is better than its open-source label would suggest. The one wrong move is adopting whatever the loudest comment section recommends without trying anything yourself, because these tools are different enough that your preference will not match the consensus.

*Written June 2026. Based on my own three months of use across my projects; these tools change fast, so check current versions before deciding.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-15",
    category: "AI / Developer Tools",
    readTime: 9,
    tags: ["ai-coding", "cursor", "copilot", "windsurf", "continue", "developer-tools", "code-generation", "ai-assistant", "productivity", "2026"],
  },
  {
    slug: "infrastructure-as-code-tools-2026-terraform-pulumi-cdk",
    title: "Infrastructure as Code Without the Boilerplate: Terraform, Pulumi, and CDK Compared",
    excerpt: "I have written infrastructure as code in all three major approaches. The real choice is between declarative simplicity and the power of a general-purpose language.",
    content: `
# Infrastructure as Code Without the Boilerplate: Terraform, Pulumi, and CDK Compared

The short version: I have written infrastructure as code in all three of the major approaches, and the choice between Terraform, Pulumi, and the AWS CDK is less about which one is best and more about who is going to read and maintain the code. Terraform is the safe default, Pulumi is the one I reach for when the logic gets complicated, and the CDK is brilliant if you are all-in on AWS and nowhere else. The honest trade-off is between declarative simplicity and the power of a real programming language, and that trade-off is not going away.

## The Problem Infrastructure as Code Actually Solves

Before comparing the tools, it is worth being precise about what they are for. The problem is that infrastructure drifts: you click buttons in a console, and a year later nobody can reproduce the environment because the clicks were never written down. Infrastructure as code fixes that by making the infrastructure a text file you can review, version, and recreate.

For a long time I did not bother with any of this, because my infrastructure was small enough to hold in my head. That was true right up until the moment it was not. The first time I had to recreate a set of cloud resources from memory after a mistake, I understood the appeal of writing it all down.

## Terraform: The Default for a Reason

Terraform is the tool most people mean when they say infrastructure as code, and it earned that spot. It uses a declarative language where you describe what you want and Terraform figures out how to get there, tracking state so it knows what it has already created. The ecosystem is enormous, the documentation is thorough, and almost any provider you can think of has a Terraform plugin.

The strength is also the limitation. HCL, the language Terraform uses, is deliberately not a general-purpose programming language, and the moment your infrastructure needs real logic, you start fighting it. Loops and conditionals exist but feel bolted on, and anything genuinely dynamic requires jumping through hoops or reaching for code generation. For the eighty percent of infrastructure that is just declaring resources, this is fine. For the twenty percent that needs logic, it is friction.

The other thing I have learned to watch is state management. Terraform's state file is the source of truth, and it needs to live somewhere safe and shared. Get that wrong and you can have a confusing day. It is a solved problem, but it is an extra thing to set up.

## Pulumi: Real Code, Real Power

Pulumi solves the logic problem by letting you write your infrastructure in a general-purpose language, TypeScript being the most common. The moment I first wrote a for-loop over a list of environments to generate the same set of resources in each, I understood why people prefer this. Anything you can express in code, you can express in your infrastructure, and you get the full power of your language's ecosystem for free.

The cost is that you are now writing programs, with all the subtlety that implies. A declarative file is easy to review because it is just a list of what exists. A TypeScript program can hide surprising behavior in a loop or a helper function, and I have caught myself writing infrastructure logic that was cleverer than it needed to be. Pulumi rewards discipline, and not everyone, including me on a bad day, has it.

It is also a smaller ecosystem than Terraform's, though it has been closing the gap, and the mental model of your infrastructure as a program is a real shift if you are coming from a declarative background.

## AWS CDK: Great, But a Bet on AWS

The AWS CDK is the same idea as Pulumi, writing infrastructure in a real language, but it is specific to AWS and it is genuinely excellent at what it does. The high-level constructs mean you can express a lot of infrastructure in very little code, and because it is so tightly integrated with AWS, the constructs match the platform's actual concepts well.

The trade-off is obvious: it only targets AWS. If your infrastructure is entirely on AWS and likely to stay there, the CDK is arguably the best tool on this list. If you have resources elsewhere, or think you might, you are signing up to manage infrastructure with two different systems, and that duplication is its own cost. I have used it on AWS-only projects and loved it, and I have watched teams tie themselves to it and then regret it when they needed a second cloud.

## How I Actually Choose

My decision rule has settled into something simple. If the infrastructure is mostly static and I want it to be boring and reviewable, I use Terraform, because declarative code is the easiest thing for a future version of me to read. If the infrastructure needs real logic, or I am generating a lot of similar resources, I use Pulumi, because a programming language is the right tool for that job. I use the CDK only when the project is committed to AWS, and even then I go in knowing what I am giving up.

The meta-lesson is that none of these tools removes the hard part. The hard part is not writing the code, it is deciding what your infrastructure should look like, and the tool just determines how much friction you feel expressing that decision. Pick the one that matches how much logic you actually have, and you will stop thinking about the tool and start thinking about the infrastructure.

*Written June 2026. Based on my own use of all three approaches across cloud projects.*
`,

    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-16",
    category: "DevOps & Infrastructure",
    readTime: 8,
    tags: ["terraform", "opentofu", "pulumi", "aws-cdk", "crossplane", "infrastructure-as-code", "iac", "devops", "cloud-infrastructure", "2026-tools"],
  },

  {
    slug: "migrating-webpack-to-vite-developer-diary",
    title: "From Webpack to Vite: The Migration I Kept Putting Off",
    excerpt: "I put off migrating from Webpack to Vite for months expecting a week of pain. The actual migration took one long afternoon, and the build got dramatically faster.",
    content: `
# From Webpack to Vite: The Migration I Kept Putting Off

The short version: I put off migrating a project from Webpack to Vite for months, expecting it to be a week of pain, and the actual migration took one long afternoon. The build got dramatically faster, the development server started feeling instant, and the parts that broke were almost all small, mechanical, and fixable in minutes. If you are sitting on a Webpack config you are afraid to touch, this is the account that might convince you it is safe.

## The Project and Why I Was Scared

The project was a small frontend that had been on Webpack for years. The config was not mine, not entirely, which is the usual story: it had grown over time, with plugins and loaders added by people who are not around anymore, and nobody fully understood what every line did. That is the real reason I kept putting off the migration. It was not the code, it was the config, a tangle of rules I was afraid would break in ways I could not predict.

The concrete pain was the development server. A save would take several seconds to reflect in the browser, sometimes long enough that I would forget what I was checking. A full production build took long enough that I would only run it when I had to. That is a bad position to be in, because it means the thing you ship is not the thing you were looking at while you worked.

## The Migration, Step by Step

The first thing I did was wrong, and I want to record it because it is the mistake I see people make. I tried to keep the Webpack config and swap out the engine underneath, preserving every custom rule. That approach collapsed almost immediately, because the whole point of Vite is that it does not need most of that configuration. The right move, which I only figured out after wasting an hour, was to start from Vite's defaults and only add back what actually broke.

So I did it clean. I installed Vite, created a minimal config, and pointed it at the entry file. Almost everything worked immediately, because Vite handles modern JavaScript, CSS, and static assets out of the box. The things that broke were the exceptions, and they were almost all the same kind of exception: places where the project relied on a Webpack-specific feature.

The common ones were environment variables accessed through a Webpack-specific pattern that I replaced with Vite's equivalent, a couple of require calls in places that needed to be import statements, and an alias or two that needed to be defined in the Vite config instead of the Webpack one. Each fix was a few minutes. None of them was the mysterious breakage I had been afraid of.

## What Changed

The speed difference was the kind of change you feel immediately. The development server started in a second or two instead of tens of seconds, and a save reflected in the browser basically instantly, with hot module replacement actually replacing modules instead of reloading the page. I did not realize how much the old slowness had been training me to avoid running the app until the new speed made me stop dreading it.

The production build was the same story, faster by a wide margin. The output was smaller, too, mostly because Vite's default chunking and minification were better than what my old, half-understood config had been producing. That was the moment I felt the real cost of having a config nobody understood: we had been shipping worse output for years because nobody wanted to touch the build.

## What I Would Do Differently

The one thing I would change is my own hesitation. The migration was not the week of pain I expected, and the time I spent dreading it was longer than the time it actually took. The lesson is not really about Webpack versus Vite, it is about how easy it is to overestimate the risk of replacing a system you do not fully understand, when the reality is that the new system is simpler and the parts that break are the parts you can see coming.

There is also a smaller, practical lesson: when you do the migration, do not try to preserve the old config. Delete it and start from the new tool's defaults. The old config is a record of problems a previous version of the tool had, and carrying it forward is carrying forward problems you no longer have.

## The Verdict

For a small frontend project, Vite is the clearly better tool in 2026, and the migration is far less risky than it looks. The development experience alone justifies it, and the faster, smaller builds are a bonus. If you are putting it off the way I was, the honest advice is to carve out an afternoon, start from defaults, and expect a handful of small mechanical fixes rather than a rebuild. You will probably finish with time to spare, and you will wonder why you waited.

*Written June 2026. This is a record of my own migration from Webpack to Vite on a small frontend project.*
`,

    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-17",
    category: "Frontend & DX",
    readTime: 8,
    tags: ["webpack", "vite", "migration", "build-tools", "react", "typescript", "developer-experience"],
  },


  {
    slug: "best-api-testing-tools-2026-postman-vs-insomnia-vs-hoppscotch",
    title: "API Testing After Postman Got Expensive: My Move to Hoppscotch",
    excerpt: "I used Postman for years, then the pricing changes made me actually look at what I was using. I moved my API testing to Hoppscotch, and here is what I lost and gained.",
    content: `
# API Testing After Postman Got Expensive: My Move to Hoppscotch

The short version: I used Postman for years without thinking about it, and then the pricing changes made me actually look at what I was using, which is when I realized I was paying for a lot of features I never touched. I moved my day-to-day API testing to Hoppscotch, and it has been a mostly painless switch. This is the honest account of what I lost, what I gained, and what I would do differently.

## The Breaking Point

Like a lot of developers, Postman was my default for anything involving an HTTP request: testing an endpoint, poking at a third-party API, sharing a collection with someone. It was free for a long time, and it worked, so I never questioned it. Then the free tier got tighter, and features I actually used started to require a paid plan, and the price, once I looked at it, was more than a tool that mostly sends HTTP requests justified for my situation.

The moment that pushed me over was not the price itself, it was the realization that I was paying for a product that had grown into a full collaboration platform when all I wanted was a sharp tool for testing requests. Collections, environments, auth handling, and a clean way to see responses were my entire wish list. Everything else was overhead I was implicitly paying for.

## What I Tried

The two serious alternatives were Insomnia and Hoppscotch. Insomnia is a polished desktop client with a clean interface and solid support for the request-and-response workflow, and I used it for a while and liked it. The GraphQL support in particular is genuinely good, and if that is your main use case it deserves a look.

Hoppscotch is the one I ended up staying with, and the reason is that it is web-first and open source. It runs in the browser, which means nothing to install and nothing to keep updated, and the interface is deliberately minimal in a way I appreciate. It does not try to be a collaboration platform. It tries to be a fast, clean tool for making requests, and it succeeds at that.

There are other tools in this space, Bruno chief among them, which stores collections as plain text files in your repo. That is a genuinely good idea, and if I were on a team that wanted API collections versioned alongside code, I would look hard at it. For my own use, Hoppscotch's zero-install convenience won out.

## What I Lost

The honest list of what I gave up is short but real. Postman's collaboration features are more mature than anything on the open-source side, so if you share collections with a team and need comments, workspaces, and shared environments, you will notice the difference. The ecosystem of pre-built collections is also larger, though I found I never actually used most of it.

The other thing I lost, for a little while, was muscle memory. Years of Postman meant my fingers knew where everything was, and the first week on Hoppscotch was slower while I rebuilt that. That cost fades fast, but it is worth budgeting for if you are switching in the middle of a busy period.

## What I Gained

The obvious gain is cost: Hoppscotch's free tier covers everything I do, and the paid tier, which I have not needed, is reasonable. For a solo developer, that alone matters, because it is real money every month.

The less obvious gain is focus. Postman's sprawl meant I spent time navigating features I did not want. Hoppscotch's minimalism means I open it, send a request, read the response, and close it. That is exactly what I wanted, and I did not realize how much the extra surface area was slowing me down until it was gone.

The self-hosting option is a quiet bonus. Because it is open source, I can run my own instance if I ever want to keep my API collections entirely on my own infrastructure, which is not something I needed, but it is good to know the door is open.

## The Takeaway

The lesson is not that Postman is bad, it is that I should periodically audit the tools I use the way I audit my spending. I had been paying for a collaboration platform when I needed a request client, and it took a pricing change to make me notice. If you use an API tool and have not looked at the alternatives in a couple of years, it is worth an afternoon to see whether the tool you actually need is simpler and cheaper than the one you have. In my case, it was.

*Written June 2026. Based on my own migration from Postman to Hoppscotch; pricing and features change, so check current offerings before deciding.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-18",
    category: "API Development",
    readTime: 8,
    tags: ["developer-tools", "devops", "2026", "CI/CD", "testing", "containers", "API", "developer-experience", "TDD", "backend"],
  },

  {
    slug: "api-versioning-strategies-2026",
    title: "API Versioning: The Strategy That Stopped Our Breaking Changes",
    excerpt: "After breaking a production consumer one too many times, I sat down and actually thought through versioning. The strategy that stuck is boring, and that is the point.",
    content: `
# API Versioning: The Strategy That Stopped Our Breaking Changes

The short version: after breaking a production consumer of my API one too many times, I sat down and actually thought through versioning instead of improvising it. The decision that stuck is boring: version in the URL path, keep breaking changes rare, and deprecate loudly and slowly. This is the account of how I got there, including the strategies I rejected and why.

## The Incident That Started It

The moment that forced the issue was unglamorous. I changed a response field from a string to an object, because it was the right change for the API going forward, and it broke an internal consumer that was still expecting a string. It was my own service, and I still got it wrong, which tells you how easy this is to get wrong. A breaking change slipped into a release with no version bump and no warning, and the failure showed up in production rather than in review.

That is the real reason versioning matters. It is not about elegance, it is about making a contract: what you promise your consumers, and what happens when you need to change that promise. Without a versioning strategy, every change is a potential surprise, and surprises in production are expensive.

## The Options, Honestly Assessed

There are four common strategies, and I looked at all of them seriously before choosing.

URL path versioning puts the version in the path, so you have endpoints like /v1/users and /v2/users. It is the most visible, the most widely understood, and the easiest to debug, because you can see the version right in the request URL. The common objection is that it pollutes the URL and that it makes the version part of the resource identity when it is really part of the contract. Those objections are real but, in my experience, outweighed by the clarity.

Header versioning puts the version in a custom header or the Accept header instead. It is cleaner in principle, keeping the URL stable and moving the contract negotiation into HTTP headers, which is arguably where it belongs. The problem is practical: it is harder to debug, because you cannot see the version in the request log line, and every consumer has to remember to set the header. For a small team, that extra ceremony is a real cost.

Query parameter versioning, adding ?version=2 to the request, is the weakest option in my view. It works, but it is the easiest to get wrong, because query parameters are easy to drop, easy to forget, and easy to confuse with actual filtering parameters. I have seen teams use it and regret it.

Content negotiation, using the Accept header to request a specific media type version, is the most principled approach and the most work. It is the right answer for a large public API with many consumers who need fine-grained control, and it is overkill for almost everyone else, including me.

## What I Chose and Why

I chose URL path versioning, and the deciding factor was not technical, it was human. The version in the URL is the version everyone can see, in logs, in docs, in a browser, in a curl command. When something breaks, the first question is which version is involved, and with the version in the path, that question answers itself. The purity arguments for headers did not survive contact with the reality of debugging at two in the morning.

The second part of my strategy is more important than the syntax: I try hard not to introduce breaking changes at all. Most of the changes I have wanted to make could be done additively, adding a new field instead of changing an old one, or keeping the old behavior alongside the new one for a while. Versioning is the safety net for when a breaking change is truly necessary, not a license to break things frequently.

## The Discipline Around It

The part people skip is the process, and it is the part that matters. When I do introduce a breaking change, it goes into a new version, the old version stays live, and I announce a deprecation window with a concrete date. Consumers get months, not days, to move. I have found that a slow, loud deprecation costs almost nothing and prevents almost all of the damage that versioning is supposed to prevent.

The other discipline is documentation. A version is only useful if the contract for that version is written down somewhere, because the whole point is that consumers can rely on what a version means. I keep a short changelog per version, and the effort is minimal because most changes are additive and the breaking ones are rare.

## The Takeaway

Versioning is one of those things that feels like a big architectural decision until you realize the important parts are small and human: pick a visible scheme, prefer additive changes, and deprecate slowly and loudly. Get those three right and the rest is just syntax. The strategy that finally stopped my breaking changes was not clever, it was just consistent, and consistency is most of what a contract actually is.

*Written June 2026. This reflects the versioning approach I use on my own APIs.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-19",
    category: "API Development",
    readTime: 8,
    tags: ["api", "versioning", "rest", "backend", "developer-experience", "postman", "best-practices"],
  },


  {
    slug: "container-orchestration-showdown-2026-kubernetes-docker-compose-nomad",
    title: "When Docker Compose Stops Being Enough: Choosing an Orchestrator",
    excerpt: "I ran Docker Compose on one VPS until it was not enough. Most people reach for Kubernetes far too early, and the honest upgrade path is slower than the marketing suggests.",
    content: `
# When Docker Compose Stops Being Enough: Choosing an Orchestrator

The short version: I ran my containers with Docker Compose for a long time, and it was fine until it was not. The moment came when a single machine was no longer enough, and I had to actually learn what an orchestrator buys you. The lesson I came away with is that most people reach for Kubernetes far too early, and the honest upgrade path is slower and less glamorous than the marketing suggests.

## The Setup I Outgrew

For a long time, my whole deployment story was a handful of services described in a docker-compose.yml file, running on one VPS. I restarted things by hand when I needed to, I watched logs by SSHing in, and if the machine went down, I brought it back and restarted everything. For one person running a small service, that was genuinely enough, and I would defend it against anyone who says you need more from day one.

The cracks showed up one at a time. First I needed a second service that had to be up all the time, and keeping two things healthy by hand stopped being trivial. Then I wanted rolling deploys, so I could ship without a brief window of downtime. Then the traffic grew enough that a single small server was running hot, and I wanted to spread the load. Each of those is a specific need, and each one maps to a specific capability an orchestrator provides. The mistake would have been to adopt a whole orchestration platform to get one of them.

## What Each Option Actually Is

Docker Compose is not an orchestrator, it is a way to describe a set of containers on a single host. It is excellent at that and nothing more, which is why it stays in my toolkit for local development and for simple single-server deployments. The moment you need more than one host, it stops being the answer.

Docker Swarm is the step most people skip, and it is worth knowing about because it is the smallest jump from Compose. It adds multi-host orchestration on top of the Docker you already know, using much of the same syntax. It has been neglected compared to Kubernetes, and it is not the fashionable choice, but for a small fleet of services it does the job without the operational weight.

Kubernetes is the industry standard, and it is a full platform, not a tool. It schedules containers across many machines, handles rolling updates, self-heals, and scales, and it does all of it with a conceptual model that takes real time to learn. The cost is not the software, it is the operational burden: you are now running a cluster, and someone has to understand it, upgrade it, and fix it when it misbehaves. That someone, for a solo developer, is you.

Nomad is the interesting alternative, lighter than Kubernetes and simpler to reason about, made by HashiCorp. It orchestrates more than containers, and it has a gentler learning curve. It has a smaller community, which is its real drawback, but the design is cleaner than Kubernetes for a modest workload.

## The Decision I Actually Made

I did not jump to Kubernetes, and I am glad I did not, because I would have spent more time operating the cluster than running my services. What I did instead was move in small steps, and each step was driven by a specific need rather than by a vague sense that I should be more modern.

For the rolling-deploy need, I found I could get most of it with a simpler setup than a full cluster, and I stayed on a managed approach for the parts I did not want to run myself. The honest version of this story is that the right answer for a solo developer is often a managed container platform, where someone else operates the orchestrator and you just deploy to it. I pay for that, and it is cheaper than the time I would spend operating my own cluster.

That is the counterintuitive conclusion I want to share: the question is not which orchestrator to run, it is whether you should run one at all. If you can rent orchestration as a service, the operational burden of Kubernetes disappears, and you get the scaling and the rolling deploys without becoming a cluster administrator. For most solo developers and small teams, that is the right trade.

## How to Know When You Are There

The concrete signal I would watch for is not traffic, it is the number of things you are babysitting by hand. When you have more than a couple of services that must stay up, when you need zero-downtime deploys, or when a single machine can no longer hold your load comfortably, you have outgrown Compose, and it is time to look up the ladder. Until then, Compose is not a toy, it is the right tool, and anyone telling you otherwise is probably selling something.

*Written June 2026. This reflects my own evolution from single-host Compose to a managed container setup.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-20",
    category: "DevOps",
    readTime: 8,
    tags: [
        "kubernetes",
        "docker-compose",
        "nomad",
        "container-orchestration",
        "benchmark",
        "devops",
        "2026",
    ],
  },
  {
    slug: "microservices-vs-monolith-2026",
    title: "I Kept the Monolith: When Not to Break Up Your Backend",
    excerpt: "The dominant advice for years has been to split monoliths into microservices, and I almost followed it. I kept the monolith, and it was the right call for my situation.",
    content: `
# I Kept the Monolith: When Not to Break Up Your Backend

The short version: the dominant advice for years has been to break monolithic backends into microservices, and I almost followed it before I stopped and thought about what I actually needed. I kept the monolith, and it was the right call for my situation. This is the argument for not breaking things up, written from the side of someone who chose the unfashionable path and does not regret it.

## The Pressure to Split

The pressure is real and it is everywhere. Conference talks, blog posts, and job descriptions all treat microservices as the destination and the monolith as the thing you leave behind. The arguments sound reasonable in the abstract: independent deployability, the freedom to use different technologies per service, teams that can move without stepping on each other. None of those arguments is wrong. The problem is that they assume a context that most projects do not actually have.

I almost split my backend for exactly the wrong reason: because it felt like the grown-up thing to do. I sketched out the service boundaries, imagined the clean architecture, and started planning the migration. Then I stopped and asked the question that should have come first: what concrete problem would the split solve?

## What I Actually Needed

When I answered that question honestly, the answer was almost nothing. I am a solo developer, or close to it. There is no team coordination problem, because there is no team to coordinate. There is no need for independent deploys, because I can deploy the whole thing whenever I want and it takes minutes. There is no technology heterogeneity problem, because one stack serves everything I do. Every problem that microservices solve was a problem I did not have.

What I did have, and what the monolith gives me, is simplicity. One codebase, one deploy, one place to debug. When something breaks, I know where to look, because there is nowhere else for it to be. That simplicity is not laziness, it is the correct engineering trade for a project of my size, and I had almost talked myself out of it.

## The Real Costs Nobody Talks About

The costs of microservices are well known in theory and easy to underestimate in practice. A distributed system is harder to debug, because a request now crosses network boundaries and you need tracing and logging just to see what happened. It is harder to test, because the interactions between services are where the bugs live. It is harder to operate, because you now have many things to deploy and monitor instead of one. And it is slower to develop in, because every cross-service change touches more surface area.

None of those costs shows up in the architectural diagram. They show up months later, when you are tracing a failure across four services and wishing you could just open one debugger. I have watched other people pay those costs, and it reinforced my decision.

## When Breaking Up Actually Makes Sense

This is not an argument that microservices are always wrong, and I want to be clear about when they earn their keep. They make sense when you have multiple teams that need to move independently, and the coordination cost of sharing a monolith is genuinely higher than the operational cost of distribution. They make sense when different parts of the system have genuinely different scaling needs, and you need to scale one service without scaling everything. They make sense when the codebase has grown large enough that a single deploy unit has become a bottleneck.

Those are all real, and none of them described my project. The mistake is not choosing microservices, the mistake is choosing them by default, as if the monolith were a failure state rather than a legitimate and often superior choice.

## What I Do Instead

The practical alternative to a full split is what I actually practice: a modular monolith. The code is organized into clear internal boundaries, so the components are separated and the coupling is controlled, but it all deploys as one unit. I get most of the maintainability benefit of separation without any of the operational cost of distribution. If a day comes when I genuinely need to scale one part independently, the internal boundaries make that split feasible without a rewrite.

That is the thing the all-in-on-microservices advice misses: you can keep the flexibility without paying for it now. A well-structured monolith is not a compromise, it is a strategy, and for a solo developer or small team it is usually the right one.

## The Takeaway

The next time you feel the pull to break up a backend, ask what specific problem it solves before you start. If the answer is that it feels like what real engineers do, that is not a reason, it is peer pressure. The monolith kept my project simple, fast to change, and easy to debug, and I would make the same choice again. Complexity is a cost, not a status symbol, and you should only pay it when the problem demands it.

*Written June 2026. This reflects my own architecture decisions on a small backend I maintain.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-21",
    category: "Backend Architecture",
    readTime: 8,
    tags: [
        "microservices",
        "monolith",
        "backend-architecture",
        "software-architecture",
        "system-design",
        "2026",
        "migration",
        "decision-framework",
    ],
  },

  {
    slug: "state-of-api-testing-2026",
    title: "The API Testing Landscape in 2026: What Changed and What It Means",
    excerpt: "The API testing landscape shifted more in the last couple of years than the decade before. The old default is now a paid platform, and a new generation of git-friendly tools is rising.",
    content: `
# The API Testing Landscape in 2026: What Changed and What It Means

The short version: the API testing tool landscape shifted more in the last couple of years than in the decade before, and the shift has a clear direction. The old default, Postman, is increasingly a paid collaboration platform, and a new generation of tools built around plain-text, git-friendly collections is rising to take the spot Postman left open. Here is what actually changed and what it means if you are picking a tool today.

## The Event That Reshaped Everything

The single biggest event was Postman's move away from being a free developer tool toward being a paid platform for teams. It is not that Postman stopped working, it is that the free tier tightened and the pricing pushed individual developers to look around. The effect was to reopen a question that had been settled for years: which API testing tool should I use? For a long time the answer was just Postman, and now it is not, and that reopened question is what all the new energy in the space is built on.

I have written separately about my own migration, so I will not repeat the personal story here. This post is the wider picture: what the landscape looks like now and where it is going.

## The Trend That Matters: Collections as Code

The most important change is not any single tool, it is a philosophy. The new tools treat API collections as plain text files that live in your repository, versioned and reviewed alongside your code, instead of as opaque data locked inside a vendor's cloud. That sounds like a small thing, and it is the kind of small thing that changes how teams work.

The benefit is the same benefit you get from infrastructure as code or configuration as code: the artifact you depend on becomes reviewable, diffable, and reproducible. A change to an API collection becomes a pull request instead of a silent edit in some web interface. For teams, that is a meaningful shift in control. For individuals, it means your collections are not hostage to a vendor's export format.

Bruno is the tool that embodies this idea most clearly, and it is the one people talk about when they talk about this trend. It stores collections as plain text on disk, and it has grown from a curiosity into a genuine alternative. There are others pushing the same idea, but Bruno is the one that has captured the most attention.

## Where Each Tool Sits Now

The honest map of the space right now is something like this. Postman remains the incumbent and the most feature-complete, and for teams that need real collaboration and do not mind paying, it is still the safe choice. Insomnia sits in a useful middle, a polished desktop client with strong GraphQL support, and it has been through ownership changes that some people find concerning. Hoppscotch is the fast, open-source, web-first option, and it has become the default for a lot of individuals who want something that just works in the browser. Bruno is the collections-as-code option, and it is the one to watch if you want your collections in your repo.

The rise of the open-source and git-friendly tools is the real story, because it marks a shift in what people value. The old tools optimized for convenience and collaboration. The new tools optimize for control and transparency, and they are winning over the people who care about those things.

## What This Means If You Are Choosing

The practical advice is to match the tool to how you work, not to the loudest recommendation. If you are an individual who just needs to send requests and read responses, Hoppscotch is hard to beat for zero friction. If you want your collections versioned in your repo, try Bruno and see if the workflow clicks. If you are on a team that needs shared workspaces and comments, Postman is still the most complete, just budget for it. If GraphQL is your main thing, Insomnia deserves a serious look.

The meta-point is that you should revisit this decision periodically. The landscape moved because a vendor changed its pricing, and it will keep moving. A tool that was the obvious choice a year ago may not be today, and the cost of checking is an afternoon, not a migration.

## The Direction I Would Bet On

If I had to predict where this goes, I would bet on the plain-text, git-friendly philosophy continuing to gain ground, because it aligns with how modern development already works. We version our code, our infrastructure, and our configuration. Versioning our API collections is the obvious next step, and the tools that make that natural are the ones that will grow. Postman is not going anywhere, but the energy has moved, and it is a good time to be choosing.

*Written June 2026. This reflects the tool landscape as I have observed it; specific tools and pricing change, so verify before deciding.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-22",
    category: "API Development",
    readTime: 8,
    tags: [
        "API-Testing",
        "Postman",
        "Bruno",
        "Hoppscotch",
        "Insomnia",
        "API-Development",
        "Developer-Tools",
        "Open-Source",
    ],
  },
  {
    slug: "rise-of-platform-engineering-2026",
    title: "Platform Engineering Without a Platform Team: What It Means for Small Teams",
    excerpt: "Platform engineering sounds like it needs a dedicated team, but the ideas work at any scale. What it actually means for a small team or a solo developer.",
    content: `
# Platform Engineering Without a Platform Team: What It Means for Small Teams

The short version: platform engineering sounds like something only large companies do, with dedicated teams and internal portals and golden paths, and for the biggest companies that is true. But the underlying ideas are useful at any scale, and I have found that applying even a fraction of them to a small project makes a real difference. You do not need a platform team to get most of the benefit; you need to treat your own developer experience as a product, even if you are the only customer.

## What Platform Engineering Actually Is

The term gets thrown around enough that it is worth pinning down. Platform engineering is the practice of building and maintaining an internal platform, a layer of tooling and defaults that sits between developers and the raw complexity of infrastructure, so that developers can ship code without fighting that complexity every time. The platform team builds the paved road, and the product teams drive on it.

The concrete artifacts are things like self-service environments, standardized deployment pipelines, golden paths that encode the approved way to do a task, and internal documentation that is actually kept current. The goal is to reduce the cognitive load on developers, because every minute spent wrestling with tooling is a minute not spent on the product.

## Why It Sounds Like It Is Not For You

The reason platform engineering feels out of reach for a small team is that all the canonical examples are large. A platform team of five supporting a hundred product engineers, an internal developer portal with a name, a catalog of services, golden paths for every workflow. If that is the picture in your head, then no, a small team does not need it, and trying to build it would be a mistake.

But the examples are large because the companies are large, not because the ideas only work at scale. The ideas are about reducing friction and standardizing the boring parts, and those problems exist on a one-person project just as much as on a hundred-person platform.

## What I Actually Adopted

What I took from platform engineering was not the portal or the team, it was the discipline. The core question, which I now ask about my own setup, is this: what are the tasks I do repeatedly, and what would it take to make them boring and reliable?

The answers were concrete. I standardized my deployment so that every project deploys the same way, which means I stop re-deriving the steps each time. I wrote down the setup steps for each project so a fresh clone runs without archaeology. I made the common workflows, running tests, building, deploying, into commands I can run without thinking. None of that requires a platform team. It requires noticing the friction and removing it.

That is the whole of it, really. The platform team is just the institutional form of a habit I can practice alone: treat the friction between having an idea and shipping it as a problem worth solving.

## The Trap to Avoid

The trap is adopting the form without the substance. A small team that builds an internal developer portal nobody asked for is just adding a new system to maintain, which is the opposite of the goal. The point of platform engineering is to reduce the number of things developers have to think about, and if your platform adds a new thing to think about, you have failed before you started.

I have seen this happen, teams building platforms as projects rather than as responses to specific pain. The healthier approach is to start from a concrete annoyance and remove it, then repeat. The platform, if it ever becomes one, grows out of those removals. It is never the starting point.

## What It Means For You

If you are a solo developer or a small team, the useful version of platform engineering is a mindset, not a team. Notice where your workflow forces you to wait or to guess, standardize the repetitive parts, and write down the things you keep forgetting. Do that consistently and you have built a platform of one, which is all most small teams ever need.

The large companies are doing something real, and the ideas are worth borrowing. You just do not need the org chart to borrow them. The paved road matters more than the team that paves it.

*Written June 2026. This reflects my own application of platform engineering ideas to a small setup.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-23",
    category: "DevOps",
    readTime: 8,
    tags: [
        "Platform Engineering",
        "DevOps",
        "Internal Developer Platform",
        "IDP",
        "Developer Experience",
    ],
  },
  {
    slug: "developer-productivity-tools-comparison-2026",
    title: "Terminal and Shell Tools I Tried and Kept: Warp, Fig, and Ghostty",
    excerpt: "I tried Warp, used Fig before it shut down, and now run Ghostty daily. The flashy features were rarely the ones I kept, and the honest reasons why.",

    content: `
# Terminal and Shell Tools I Tried and Kept: Warp, Fig, and Ghostty

The short version: I spent a stretch trying to upgrade my terminal and shell setup, and it taught me something about developer tools: the flashy features are rarely the ones you keep. I tried Warp and kept it for its genuinely useful command output handling, I used Fig briefly before it shut down, and I now run Ghostty as my daily terminal, mostly for reasons that are about speed and restraint rather than features. Here is the honest account of what stuck and what did not.

## Why I Went Looking

I spend a large fraction of my working day in a terminal, which means small frictions in that environment compound into real lost time. The specific annoyances that sent me looking were familiar: output that scrolled past and was painful to find, a history that did not help me recall the exact command I ran last week, and a general sense that my terminal had not changed in twenty years while everything else had.

The tools I ended up trying were the ones everyone in this niche talks about: Warp, the modern terminal with a different take on the interface; Fig, which did autocomplete for the terminal; and Ghostty, the newer, performance-focused terminal that came out of nowhere and got a lot of developer attention.

## Warp: The One With Real Ideas

Warp is the most ambitious of the three, and it is the one that changed how I think a terminal could work. Its headline feature is that it treats command output as structured blocks you can select, copy, and search instead of a wall of scrolling text. That sounds minor, and it is the kind of thing you have to use to appreciate. The first time I grabbed a file path out of a long output by clicking instead of squinting and dragging, I understood.

It also folds in AI features, suggesting commands and explaining errors, which I found useful in moderation and occasionally gimmicky. The honest criticism is that Warp is heavier than a plain terminal, and there were times the interface got in the way of just typing. It is a tool that rewards investment, and for a while I invested. I did not ultimately stay on it as my daily driver, but I respect it, and for someone who wants a terminal that actively helps, it is the one to try first.

## Fig: The One That Disappeared

Fig is the cautionary tale in this list, and I mention it because it is a real thing that happened, not as a knock on the team. Fig did autocomplete for the shell, turning the terminal into something closer to an IDE with suggestions as you typed, and it was genuinely delightful. A lot of people, me included, found it made the command line friendlier.

Then Fig was acquired, and the product was shut down, and everyone who had built it into their workflow had to find something else. The lesson is not about Fig specifically, it is about the risk of building your daily workflow on a closed, VC-funded tool that can disappear overnight. It made me more cautious about adopting tools whose core value is tied to a service that can be switched off.

## Ghostty: Where I Landed

Ghostty is the terminal I run now, and it is the opposite of Warp in philosophy. It does not try to add features or rethink the interface. It tries to be a fast, correct, native terminal that gets out of the way, and it succeeds. The launch story was that it prioritizes performance and correctness, and in daily use that is exactly what you feel: it starts instantly, renders instantly, and never gets in the way.

The thing I value most about it is that it is boring in the best sense. A terminal should be a reliable substrate for everything else, not a product with opinions about how I should work. Ghostty has almost no opinions, and after the Warp and Fig experiments, that restraint is exactly what I wanted. I configure it, and then I stop thinking about it, which is the highest compliment I can give a terminal.

## What I Kept, What I Did Not

The through-line of this whole exercise is that the features I thought I wanted were not the features I kept. I thought I wanted autocomplete and AI suggestions, and I ended up wanting speed and restraint. The tools I kept are the ones that disappeared into the background, and the ones I did not keep were the ones that kept demanding my attention, even when that attention was pleasant.

There is a broader lesson here for tool adoption in general, and I have applied it beyond terminals. The best tool is usually not the one with the most impressive demo, it is the one you forget you are using. Before you adopt something new, ask whether it is going to stay out of your way or become a hobby of its own. The answer has saved me from more than one regrettable switch.

*Written June 2026. This reflects my own experience with these tools; they change quickly, so check current versions before deciding.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-24",
    category: "Developer Productivity",
    readTime: 8,
    tags: [
        "Terminal-Emulators",
        "Developer-Productivity",
        "Warp",
        "Ghostty",
        "Fig",
        "Developer-Tools",
        "macOS",
    ],
  },
  {
    slug: "ai-assisted-development-how-coders-really-use-ai-2026",
    title: "How I Actually Use AI When I Write Code (Not How the Demos Show It)",
    excerpt: "The way I use AI to code has little in common with the demos. The reality is messier and more useful, and the demos get exactly the wrong part right.",
    content: `
# How I Actually Use AI When I Write Code (Not How the Demos Show It)

The short version: the way I use AI to write code has very little in common with the demos, where someone types a sentence and watches a whole app assemble itself. The reality is messier and more useful: AI is strongest in the small, unglamorous places, and it is weakest exactly where the marketing suggests it is strongest. Here is what a real day of coding with AI actually looks like for me, honestly.

## The Gap Between the Demo and the Day-to-Day

The demo version of AI coding is seductive because it is dramatic: you describe a feature in plain language, and minutes later you have a working implementation. I have seen that happen, and it is real, but it is a small fraction of my actual use, and treating it as the norm is how people end up disappointed or, worse, overconfident.

The honest version is that most of my AI-assisted coding is the kind of thing that would not make a demo at all. It is finishing a line I was typing, generating a boilerplate function I have written a hundred times, writing a test case for a function I just wrote, or explaining an error message I do not want to spend five minutes decoding. None of it is dramatic. All of it compounds into a lot of saved time.

## The Small Things It Is Genuinely Good At

The highest-value use for me is mechanical generation: the repetitive code where I know exactly what I want but do not want to type it. Data classes and type definitions, a function that maps one object shape to another, a set of CRUD endpoints that follow the same pattern as the last three. AI is excellent at this, and it saves me real time, because it is the kind of code that is easy to specify and tedious to write.

The second highest is test generation. Given a function I just wrote, the AI can produce a reasonable set of test cases, including the edge cases I might have forgotten. I always review and often rewrite, but having a first draft of the tests is faster than staring at a blank file, and the edge cases it surfaces are occasionally ones I genuinely missed.

The third is explanation and navigation. When I am dropped into unfamiliar code, or hit an error whose message is cryptic, asking the AI to explain what is happening is faster than searching, and it works well enough to be a first stop rather than a last resort. This is not generating code at all, but it might be the most reliable value.

## Where It Falls Down

The failures are just as important to name, because they are where the risk lives. AI is weakest when the task requires context it does not have: the reasons a system was built a certain way, the constraints that are not in the code, the edge cases that only exist in a specific production environment. For those, it confidently produces plausible-looking code that is wrong in ways that are hard to spot, because the wrongness is buried in an assumption the AI does not know it is making.

I have also found it degrades on large, cross-cutting changes. Ask it to make a small, well-scoped edit and it is reliable. Ask it to refactor a system across many files and it will produce something that looks complete but has subtle inconsistencies. The lesson I keep relearning is to give it small tasks with clear boundaries and to verify each one, rather than large tasks and trusting the result.

## How I Actually Work With It

My workflow has settled into a rhythm that keeps me in control. I write the parts that require judgment myself: the architecture, the tricky logic, the places where I know something about the domain that the AI does not. I delegate the parts that are mechanical: the boilerplate, the tests, the mapping functions. I treat the AI as a fast junior collaborator whose work I always review, not as a replacement for my own thinking.

The review step is non-negotiable, and I have learned this the hard way. Every line the AI writes gets read, and I am especially suspicious of the parts that look right but touch something subtle. The cost of review is real, but it is smaller than the cost of shipping an AI's plausible mistake, and the discipline is what keeps the whole arrangement safe.

## The Takeaway

AI-assisted coding is a genuine productivity win, but only if you use it for what it is actually good at and keep the judgment for yourself. The demos sell the dream of describing an app into existence, and that dream, while occasionally real, is not where the day-to-day value lives. The value lives in the small, repetitive, well-specified work, done fast and reviewed carefully. Use it there, and it earns its place. Expect it to do the whole job, and it will eventually let you down in a way that is expensive to fix.

*Written June 2026. This reflects my own day-to-day use of AI coding tools across my projects.*
`,
    author: "Long Feixiang",
    authorRole: "Independent Developer",
    date: "2026-06-25",
    category: "AI & Development",
    readTime: 8,
    tags: [
        "AI",
        "Developer-Productivity",
        "AI-Coding-Assistants",
        "Platform-Engineering",
        "Developer-Experience",
    ],
  },
];