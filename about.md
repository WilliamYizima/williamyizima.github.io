---
layout: page
permalink: /about/index.html
title: Will Yizima
tags: [Will, Yizima]
imagefeature: fourseasons.jpg
chart: true
---
<figure>
  <img src="{{ site.url }}/images/will.png" alt="Will">
  <figcaption>Buda e Will</figcaption>
</figure>

{% assign total_words = 0 %}
{% assign total_readtime = 0 %}
{% assign featuredcount = 0 %}
{% assign statuscount = 0 %}

{% for post in site.posts %}
    {% assign post_words = post.content | strip_html | number_of_words %}
    {% assign readtime = post_words | append: '.0' | divided_by:200 %}
    {% assign total_words = total_words | plus: post_words %}
    {% assign total_readtime = total_readtime | plus: readtime %}
    {% if post.featured %}
    {% assign featuredcount = featuredcount | plus: 1 %}
    {% endif %}
{% endfor %}


E aí! Meu nome é **William J. Yizima**, e neste local haverá coisas incríveis para qualquer um aprender sobre NLP e outras magias. 


**Compartilhando o mesmo sentimento e pensamento** do criador deste template:

> I make stuff. <br>
> I make what I love.<br>
> *I love what I do.*<br>
> For <br>
> the makers,  <br>
> the creators,  <br>
> the discoverers,  <br>
> the original thinkers,  <br>
> ***This is the space to create.***
<br>
<center> <h2>Espero que goste!</h2></center>
<br>
<figure>
  <img src="{{ site.url }}/images/kaizen.png" alt="Hossain Mohammad Faysal">
  <figcaption>Espero que alguma palavra neste blog, mude sua vida</figcaption>
</figure>