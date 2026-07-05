/**
 * YouTube video IDs for devex-tools.net tools.
 * Each video is the best available review/tutorial for the tool.
 * 
 * Empty string = fallback to "Watch on YouTube" search link
 */
export const YOUTUBE_VIDEOS: Record<string, string> = {
  // IDEs & Code Editors
  "vscode": "AdygBbbEnco",           // Fireship - Best OS for programming?
  "intellij-idea": "gJrjgg1KVL4",    // Programming with Mosh - Spring Boot Tutorial
  "sublime-text": "-6ikAMmu3Nc",     // Tech With Tim - Sublime Text settings
  "vim": "AsoaYO_TDKw",              // The PrimeTime - Vim vs Neovim
    "eclipse-ide": "OZRbkkEuQMI",         // SuperWits Academy — Eclipse IDE tutorial
  "neovim": "7xFOxIrHyHE",           // The PrimeTime - Neovim
  "webstorm": "h55emgImrLk",         // Fireship - Fleet vs VS Code
  "xcode": "8PhdfcX9tG0",            // Fireship - I tried 10 code editors
  "android-studio": "L0AUi4Qn7g8",   // Jagat Review - Android Studio
  "pycharm": "eXinDi55iOk",          // Tech With Tim - Best Python IDEs

  // Version Control
  "github": "R8_veQiYBjI",           // TechWorld with Nana - GitHub Actions
  "gitlab": "qP8kir2GUgo",           // TechWorld with Nana - GitLab CI CD
    "bitbucket": "8JJ101D3knE", // Programming with Mosh — Git Tutorial for Beginners: Learn Git in 1 Hour
  "sourceforge": "f3POJdp79Mc",      // SourceForge review
    "apache-subversion": "2xtDhubzQtw", // Mathias Magdowski — Versionskontrolle mit Apache Subversion inklusive 

  // CI/CD
  "jenkins": "chkdyPcgAUo",          // IBM Technology - Tekton vs Jenkins
  "github-actions": "JSuS-zXMVwE",   // Fireship - Cursor ditches VS Code
  "circleci": "1HpEagsIY2o",         // Paperclick - CircleCI vs Jenkins vs GitHub Actions
  "gitlab-ci-cd": "qP8kir2GUgo",     // TechWorld with Nana - GitLab CI CD
  "travis-ci": "JsEd6dpLGbs",        // Bluelight Co - Best CI/CD Tools
  "teamcity": "Byk9XQtaNzY",         // TeamCity game (placeholder)
    "bamboo": "fl_AelgaWKE", // Angus Wan — Plastic vs. bamboo matcha whisk. What’s better?
  "argocd": "MeU5_k9ssrs",           // TechWorld with Nana - ArgoCD
  "spinnaker": "jYtC8cDq4b0",       // Google Cloud Tech - Spinnaker CI/CD pipeline
    "drone-ci": "myCcJJ_Fk10", // LinkGenius Picks — কম দামে best drone camera😳 || e88 max drone full r

  // API Development
  "postman": "CLG0ha_a0q8",          // Code Bless You - Postman API Testing
  "swagger": "8yI4gD1HruY",          // Nick Chapsas - Swagger gone in .NET 9
  "insomnia": "ged7dQmnmlQ",         // Paperclick - Postman vs Insomnia
  "hoppscotch": "tibdI9KnQec",       // Hoppscotch review
  "apollo-graphql": "eIQh02xuVw4",   // Fireship - GraphQL in 100 Seconds
    "rapidapi": "MbqSMgMAzxU", // Fireship — Make Money from your API Tutorial

  // Database Tools
  "dbeaver": "4FNi5vCwRHE",         // Smart Postgres - DBeaver vs DataGrip vs VS Code
  "pgadmin": "n2Fluyr3lbc",         // Fireship - PostgreSQL in 100 Seconds
  "mongodb-compass": "-bt_y4Loofg",  // Fireship - MongoDB in 100 Seconds
  "tableplus": "BW-YO9fqFho",       // Paperclick - TablePlus vs DataGrip
  "datagrip": "BW-YO9fqFho",        // Paperclick - TablePlus vs DataGrip
    "mysql-workbench": "Q7i6zxHVj2Q", // Alex The Analyst — MySQL vs Postgresql vs Microsoft SQL Server Manage
    "redisinsight": "yta9xLUGKgM", // Net Ninja — Redis Tutorial for Beginners #2 - Making a Redis D
  "studio-3t": "_m8EwrVwzLo",      // Studio 3T - MongoDB tool

  // Container & Orchestration
  "docker": "eGz9DS-aIeY",          // NetworkChuck - Docker Containers 101
  "kubernetes": "qTpO41MJzYg",      // TechWorld with Nana - Docker vs K8s vs Swarm
  "terraform": "l5k1ai_GBDE",       // TechWorld with Nana - Terraform explained in 15 mins
  "ansible": "1id6ERvz2Vo",         // TechWorld with Nana - What is Ansible
  "helm": "idF3eO4q1p4",           // TechWorld with Nana - What is Helm in Kubernetes
  "podman": "e6Q-P-60qis",          // Savage Reviews - Podman vs OrbStack
  "vagrant": "2iS0yZ4NkHs",        // Traversy Media - Vagrant Crash Course
    "packer": "OmQRpi3CSjU", // Benji Astrom — EXTREMELY realistic packer review | Emisil GERALD 

  // Monitoring & Debugging
  "datadog": "m4d5RHjWv4M",        // How2Genius - Grafana vs Datadog
    "sentry": "OgcywpJrhGk", // HeroBattle — Sentry vs Homelander #shorts #short #sentry #homel
  "grafana": "X2KAFyFLagM",        // Fireship - Grafana is the goat
  "prometheus": "h4Sl21AKiDg",     // TechWorld with Nana - Prometheus Monitoring
  "new-relic": "JNOvfNIZNLA",      // AIM Network - New Relic Observability
  "splunk": "3CiRs6WaWaU",         // Jon Good - Splunk Tutorial
  "elasticsearch": "gS_nHTWZEJ8",  // Elastic Community - Elastic Stack Crash Course
    "jaeger": "cYAE0ZhT43c", // theartwatches — Watch Collector Problems: Jacob &amp; Co vs FPJOUR
    "opentelemetry": "hLvwoow3XTk", // IBM Technology — OpenTelemetry: Simplifying Hybrid Cloud Monitoring
    "chronosphere": "osA4MBysMZQ", // hOlyhexOr — the best chronosphere you will see today

  // Test Automation
    "jest": "7f-71kYhK00", // Web Dev Simplified — Why Vitest Is Better Than Jest
    "selenium": "NB8OceGZGjA", // Tech With Tim — Python Selenium Tutorial - Automate Websites and C
    "cypress": "BQqzfHQkREo", // Fireship — Cypress in 100 Seconds
};