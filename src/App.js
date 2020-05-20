import React from 'react';
import './App.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';

import GridLayout from "react-grid-layout";

import furnitures from './data/furnitures.json';
import floors from './data/floors.json';

import _ from "lodash";

class App extends React.Component {
  static defaultProps = {
    onLayoutChange: function () {},
  };

  constructor(props) {
    super(props);
    this.state = {
      layout: [],
      objects: {},
      floor: "/images/floors/RoomSpFloorFishTank00.png",
    };
  }

  componentDidMount = () => {
    this.resetLayout();
  }

  resetLayout = () => {
    const reducedFurnitures = furnitures.results.filter(
      (furniture) => furniture.category !== "Wall-mounted"
    );

    const shuffledFurnitures = reducedFurnitures.sort(
      () => 0.5 - Math.random()
    );
    const slicedFurnitures = shuffledFurnitures.slice(0, 10);
    const layoutFurnitures = slicedFurnitures.map((furniture, i) => ({
      i: furniture.content.name,
      x: i,
      y: Math.floor(Math.random() * 6),
      w: furniture.content.size.cols,
      h: furniture.content.size.rows,
    }));
    this.setState({layout: layoutFurnitures});

    let objects = {};
    slicedFurnitures.forEach((furniture, i) => objects[furniture.name] = furniture);
    this.setState({objects});
    
    const shuffledFloors = floors.results.sort(
      () => 0.5 - Math.random()
    );
    const firstFloorImage = shuffledFloors[0].image;
    this.setState({ floor: firstFloorImage });
  };

  onAddItem = () => {
    const reducedFurnitures = furnitures.results.filter(
      (furniture) => furniture.category !== "Wall-mounted"
    );
    const shuffledFurnitures = reducedFurnitures.sort(
      () => 0.5 - Math.random()
    );
    const randomFurniture = shuffledFurnitures[0];
    
    this.setState(prevState => {
      let objects = Object.assign({}, prevState.objects);
      objects[randomFurniture.name] = randomFurniture;
      return { objects }
    });

    this.setState({
      layout: this.state.layout.concat({
        i: randomFurniture.content.name,
        x: 0,
        y: 0,
        w: randomFurniture.content.size.cols,
        h: randomFurniture.content.size.rows,
      }),
    });
  }

  onRemoveItem(i) {
    this.setState({ layout: _.reject(this.state.layout, { i: i }) });
  }

  onLayoutChange = (layout) => {
    /*eslint no-console: 0*/
    this.setState({ layout });
    this.props.onLayoutChange(layout); // updates status display
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>Animal Grid</p>
          <button onClick={this.resetLayout}>
            Reset
          </button>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                height: 50,
                width: 50,
                backgroundImage: `url(https://acnhcdn.com/latest/FtrIcon/FtrIllumiPresent_Remake_0_0.png)`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "100%",
                className: "tooltip",
              }}
            />
            <button onClick={this.onAddItem}>Add</button>
            <input type="text" placeholder="Type an item" style={{ margin: 5 }} />
          </div>
        </header>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'gray', height: 400 + 50 * 2}}>
          <div
            style={{
              width: 400,
              height: 400,
              backgroundImage: `url("${this.state.floor}")`,
              backgroundSize: 50,
              backgroundRepeat: "space",
            }}
          >
            <GridLayout
              className="layout"
              layout={this.state.layout}
              cols={8}
              maxRows={8}
              rowHeight={50}
              width={400}
              compactType={null}
              isResizable={false}
              margin={[0, 0]}
              onLayoutChange={this.onLayoutChange}
            >
              {this.state.layout.map((el) => (
                <div key={el.i}>
                  <div className="tooltip">
                    <span className="tooltiptext">{el.i}</span>
                    <div
                      style={{
                        height: 50 * el.h,
                        width: 50 * el.w,
                        backgroundImage: `url(${
                          this.state.objects[el.i].content.image
                        })`,
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "100%",
                        className: "tooltip",
                      }}
                    />
                  </div>
                  <span
                    className="remove"
                    onClick={this.onRemoveItem.bind(this, el.i)}
                    style={{
                      position: "absolute",
                      right: "2px",
                      top: 0,
                      cursor: "pointer",
                    }}
                  >
                    x
                  </span>
                </div>
              ))}
            </GridLayout>
          </div>
        </div>
      </div>
    );
  }
}

export default App;