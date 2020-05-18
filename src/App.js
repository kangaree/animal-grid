import React from 'react';
import './App.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';

import GridLayout from "react-grid-layout";

import furnitures from './data/furnitures.json';
import floors from './data/floors.json';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layout: [],
      floor: "/images/floors/RoomSpFloorFishTank00.png",
    };
  }

  componentDidMount = () => {
    this.resetLayout();
  }

  resetLayout = () => {
    const reducedFurnitures = furnitures.results.filter((furniture) => furniture.category !== "Wall-mounted");

    const shuffledFurnitures = reducedFurnitures.sort(
      () => 0.5 - Math.random()
    );
    const slicedFurnitures = shuffledFurnitures.slice(0, 10);
    const mapFurnitures = slicedFurnitures.map((furniture, i) => ({
      i: furniture.content.image + i,
      x: i,
      y: Math.floor(Math.random() * 6),
      w: furniture.content.size.cols,
      h: furniture.content.size.rows,
      img: furniture.content.image,
      name: furniture.content.name,
      furniture,
    }));
    this.setState({layout: mapFurnitures});
    
    const shuffledFloors = floors.results.sort(
      () => 0.5 - Math.random()
    );
    const firstFloorImage = shuffledFloors[0].image;
    this.setState({ floor: firstFloorImage });
  }

  render() {
    return (
      <div
        className="App"
        style={{
          // backgroundColor: "blue",
          backgroundImage: "url(/images/floors/RoomTexFloorLawn00.png)",
          backgroundSize: "2%",
        }}
      >
        <header className="App-header">
          <p>Villager Grid</p>
        </header>
        <button onClick={this.resetLayout} style={{ margin: 50 }}>
          Reset
        </button>
        <div
          style={{
            width: 400,
            height: 400,
            margin: "auto",
            marginBottom: 50,
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
          >
            {this.state.layout.map((el) => (
              <div key={el.i}>
                <div className="tooltip">
                  <span className="tooltiptext">{el.name}</span>
                  <div
                    style={{
                      height: 50 * el.h,
                      width: 50 * el.w,
                      backgroundImage: `url(${el.img})`,
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "100%",
                      className: "tooltip",
                    }}
                  />
                </div>
              </div>
            ))}
            <div
              key="bottomBorder"
              data-grid={{ x: 0, y: 8, w: 8, h: 4, static: true }}
              style={{
                width: 400,
                height: 50,
              }}
            />
          </GridLayout>
        </div>
      </div>
    );
  }
}

export default App;