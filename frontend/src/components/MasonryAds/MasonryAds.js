import React, { Component } from 'react';
import '../../styles/components/MasonryAds.scss';

export default class MasonryAds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: 1,
    };
    this.masonry = React.createRef();
  }

  componentDidMount() {
    this.onResize();
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  getColumns(w) {
    const { brakePoints } = this.props;
    return (
      brakePoints.reduceRight((p, c, i) => {
        return c < w ? p : i;
      }, brakePoints.length) + 1
    );
  }

  onResize = () => {
    const { columns: columntsState } = this.state;
    const columns = this.getColumns(this.masonry.current.offsetWidth);
    if (columns !== columntsState) {
      this.setState({
        columns,
      });
    }
  };

  mapChildren() {
    const { columns } = this.state;
    const { children } = this.props;
    let col = [];
    const numC = columns;
    for (let i = 0; i < numC; i++) {
      col.push([]);
    }
    return children.reduce((p, c, i) => {
      p[i % numC].push(c);
      return p;
    }, col);
  }

  render() {
    return (
      <div className="masonry" ref={this.masonry}>
        {this.mapChildren().map((col, index) => {
          return (
            <div className="column" key={index}>
              {col.map((child, i) => {
                return (
                  <div key={i} className="childWrapper">
                    {child}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
}
