---
layout: default
title: Home
---

# Hello 👋, I'm Jordy!

***Passionate Developer | Blockchain Enthusiast | Security Auditor***

I love exploring new technologies and applying them to real-world problems. Founder of [Nefkon](https://nefkon.com), dedicated to creating innovative and impactful software solutions.

## About Me

I'm a passionate developer with a keen interest in blockchain technology, NFTs, and cyber security. As the founder of [Nefkon](https://nefkon.com), I'm dedicated to creating innovative and impactful software solutions.

I actively participate in security audit contests on platforms like Code4rena, Sherlock, and CodeHawks, constantly improving my skills and contributing to the security of blockchain projects.

### 2025 Goals

Currently learning Rust and planning to build innovative projects with it!

<section id="projects" class="projects-section">

## Projects I'm Proud Of <br>

{% for project in site.data.projects %}
<div class="project">
    <h3>{{ project.name }}</h3>
    {% if project.tvl %}
    <p class="tvl">TVL: {{ project.tvl }}</p>
    {% endif %}
    <p>{{ project.description }}</p>
    <a href="{{ project.url }}" target="_blank" class="project-link">Visit {{ project.name }} →</a>
</div>
{% endfor %}

</section>

<section id="skills" class="skills-section">

## Technical Skills

### Languages
- Solidity
- Python
- Go
- JavaScript
- PHP
- Rust (Learning)

### Frameworks
- Vue.js
- Laravel
- Django

### DevOps & Tools
- Kubernetes
- Docker
- Prometheus
- Grafana
- SaltStack

</section>

## Let's Connect!

Feel free to reach out if you want to collaborate on a project or just want to chat!

- [Twitter](https://twitter.com/{{ site.twitter_username }})
- [Telegram](https://t.me/{{ site.telegram_username }})
- [LinkedIn](https://www.linkedin.com/in/{{ site.linkedin_username }})
- [Email](mailto:{{ site.email }})
- [GitHub](https://github.com/{{ site.github_username }})

