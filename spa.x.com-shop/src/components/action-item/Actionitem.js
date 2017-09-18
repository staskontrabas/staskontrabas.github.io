import React from 'react';
import { Link } from 'react-router'; 

export default ({act}) => {
  return (
    <Link className="actions-item" to={`/actions/${act.id}`}>
      <img className="actions-item__img" src={act.img} />
      <span className="actions-item__text">
        <span className="actions-item__date">{act.date}</span>
        <span className="actions-item__title">{act.title}</span>
      </span>
    </Link>
  );
}