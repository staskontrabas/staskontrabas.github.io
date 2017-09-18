import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import NewsCarousel from '../../components/news-carousel';
const data = require('../../static/json/news.json');
const data2 = require('../../static/json/news2.json');
const news = {
  shop: data,
  dom: data2
}

class News extends React.Component {
  render() {
    console.log('news',this.props,news[this.props.room.room]);
    return (
      <div className="layout layout_ident_left">
        <Link className="link link_category" to="/news">Новости</Link>
        <NewsCarousel data={news[this.props.room.room].data}/>
      </div>
    );
  }
}
const mapStateToProps = (state, ownProps) => ({
  room: state.room
})

export default connect(mapStateToProps)(News);