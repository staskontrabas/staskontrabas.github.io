import React from 'react';
import CategoryItem from '../../components/category-item';

const categoryList = [
  { id: '1', url: 'compscopl', name: 'compscopl', href: '#', value: 'grteКомпьютеры и комплектующие' },
  { id: '2', url: 'compscopl', name: 'compscopl', href: '#', value: 'Компьютеры и комплектующие' },
  { id: '3', url: 'compscopl', name: 'compscopl', href: '#', value: 'Компьютеры и комплектующие' },
  { id: '4', url: 'compscopl', name: 'compscopl', href: '#', value: 'Компьютеры и комплектующие' },
  { id: '5', url: 'compscopl', name: 'compscopl', href: '#', value: 'Компьютеры и комплектующие' },
  { id: '6', url: 'compscopl', name: 'compscopl', href: '#', value: 'Компьютеры и комплектующие' },
  { id: '7', url: 'compscopl', name: 'compscopl', href: '#', value: 'Компьютеры и комплектующие' },
  { id: '8', url: 'compscopl', name: 'compscopl', href: '#', value: 'Компьютеры и комплектующие' }
];

export default class CategoryList extends React.Component {
  render () {
    return (
      <div className="category-list-wrapper">
        {categoryList.map((cat, i) => (
          <CategoryItem key={i} url={cat.url} value={cat.value} />
        ))}
      </div>
    );
  }
}