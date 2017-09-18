import React from 'react';
import { Link } from 'react-router'; 


export default ({news}) => {
  return (
    <Link className="news-item" to={`/news/${news.id}`}>
      <span className="news-item__img-wrapper">
        <img className="news-item__img" src={news.img} />
      </span>
      <span className="news-item__text">
        <span className="news-item__date">{news.date}</span>
        <span className="news-item__title">{news.title}</span>
        <span className="news-item__info">{news.desc}</span>
      </span>
    </Link>
  );
}