import React from 'react';
import { Link } from 'react-router'; 

export default () => {
  return (
    <Link className="category__item" to="/catalog">
      <span className="category__icon">
        <span className="icon icon_folder" />
      </span>
      <span className="category__text">
        <span className="text text_size_large">Комплектующие</span>
      </span>
    </Link>
  );
}