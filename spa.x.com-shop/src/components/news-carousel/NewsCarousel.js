import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import axios from 'axios';
import OwlCarousel from 'react-owl-carousel2';
import "./owl.carousel.css";

const options = {
    rewind: true,
    autoWidth:true,
    width: 300,
    dots: false
};

class NewsCarousel extends React.Component {
    
  componentDidMount() {
    const datamap = this.props.data;
    const self = this;
    axios.get('http://www.xcom-'+this.props.room.room+'.ru/ajax_request/?interface=news&action=getList&news_page=1&utm_medium=mobile&utm_source=mobilesite', {mode: 'cors'})
    //axios.get('/bridge.php')
      .then(function (res) {
        console.log(res);
        self.setState({ data: res.data });
      })
      .catch(function (error) {
        //self.setState({ data: datamap });
        console.log(error);
      });
  }
  componentWillUnmount() {
  }
  render() {
    const data = this.state ? this.state.data.data : this.props.data;
    console.log('j',this.state,this.props);
    var d = 1502139600;
    var dd = new Date();
    console.log(d);
    console.log(dd.getTime());
    //<div className="carousel last-articles-list" data-options='{"autoWidth":true,"dots":false}'>
    //<div className="carousel last-articles-list" data-options='{"autoWidth":true,"dots":false}' ref={el => this.el = el}>
    return (
      <OwlCarousel ref="car" options={options}>
        {
          data.map((item, key) => {
            var img = `//www.xcom-shop.ru/var/files/${item.image}`;
            var date = new Date(parseFloat(item.dtime) * 1000),
              day = date.getDate(),
              arMonth = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
              month = arMonth[date.getMonth()];
            return (
              <Link key={key} className="last-article" to={item.pk_publication} style={{minHeight: '94px'}}>
                <span className="last-article__img">
                  <img src={img} style={{width:'80px', height: '80px'}}/>
                </span>
                <span className="last-article__text">
                  <span className="last-article__title">
                    {item.name}
                  </span>
                  <span className="last-article__date">
                  {day} {month}
                  </span>
                </span>
              </Link>
            )
          })
        }
      </OwlCarousel>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  room: state.room
})

export default connect(mapStateToProps)(NewsCarousel);