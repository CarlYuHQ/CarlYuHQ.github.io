---
layout: archive
title: "Notes"
permalink: /Notes/
author_profile: true
---

{% include base_path %}




## 观点与本站发展

   <details><summary>点击展开 </summary>
  <div class="timeline-container">
        <!-- 2022 秋 -->
    <div class="timeline-item">
      <div class="timeline-node"></div>
        <div class="content">
                <h3>Hello! Good Bye! And Restart!</h3>
                <span class="time">2025 春</span>
                <p>个人主页目前部署在Github上，欢迎大家关注和讨论</p>
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
