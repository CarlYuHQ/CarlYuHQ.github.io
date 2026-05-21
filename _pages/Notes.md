---
layout: archive
title: "Notes"
permalink: /Notes/
author_profile: true
---

{% include base_path %}




## 观点与本站发展 {#site-views}

<details class="ac-site-views-details"><summary>点击展开</summary>
  <div class="timeline-container">
    <div class="timeline-item">
      <div class="timeline-node"></div>
      <div class="content">
        <h3>主页与 Hexo 博客集成</h3>
        <span class="time">2026-05-21</span>
        <p>随笔博客迁至 <a href="https://carlyuhq.github.io/Blogs/">Hexo（/Blogs/）</a>，通过 atom.xml 自动同步到首页「最新动态」；废弃 Jekyll Blogs 子站。课程笔记仍保留在本页 Notes，本站改版说明见下方时间轴。</p>
        <ul>
          <li>顶栏 <strong>Blogs</strong> 外链至 Hexo，与主页统一 Animal Island 风格</li>
          <li>主页「最新动态」由 <code>site_updates.yml</code> + Hexo Feed 合并生成</li>
        </ul>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-node"></div>
      <div class="content">
        <h3>主页新增最新动态与每日 Routine</h3>
        <span class="time">2026-05-20</span>
        <p>首页增加「最新动态」时间轴与「每日 Routine」打卡区，并接入 Animal Island 主题与日夜切换。</p>
      </div>
    </div>
    <div class="timeline-item">
      <div class="timeline-node"></div>
      <div class="content">
        <h3>Hello! Good Bye! And Restart!</h3>
        <span class="time">2025 春</span>
        <p>个人主页部署在 GitHub Pages，欢迎大家关注和讨论。</p>
      </div>
    </div>
  </div>
</details>



## Looking forward to see you in PKU!

{% assign paths = "Data-Structure-Algorithm.md" | split: "," %}

{% for post in site.Notes reversed %}
  {% for path in paths %}
    {% if post.path contains path %}
      {% include archive-single.html %}
      {% break %}
    {% endif %}
  {% endfor %}
{% endfor %}
