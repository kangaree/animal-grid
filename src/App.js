import React from 'react';
import './App.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';

import GridLayout from "react-grid-layout";

import furnitures from './data/furnitures.json';
import floors from './data/floors.json';
import wallpaper from './data/wallpaper.json';

import _ from "lodash";

import Modal from "react-modal";

class App extends React.Component {
  static defaultProps = {
    onLayoutChange: function () {},
  };

  constructor(props) {
    super(props);
    this.state = {
      layout: [],
      objects: {},
      variations: {},
      floor: "/images/floors/RoomSpFloorFishTank00.png",
      wallpaper: "/images/wallpaper/Wallpaper_arched_window.png",
      locked: false,
      searchValue: '',
      searchedFurnitures: [],
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
    };
  }

  componentDidMount = () => {
    this.resetLayout();
  };

  resetLayout = () => {
    this.handleCloseModal();

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
    this.setState({ layout: layoutFurnitures });

    let objects = {};
    slicedFurnitures.forEach(
      (furniture, i) => (objects[furniture.name] = furniture)
    );
    this.setState({ objects });

    const shuffledFloors = floors.results.sort(() => 0.5 - Math.random());
    const firstFloorImage = shuffledFloors[0].image;
    this.setState({ floor: firstFloorImage });

    const shuffledWallpaper = wallpaper.sort(() => 0.5 - Math.random());
    const firstWallpaperImage = shuffledWallpaper[0].image;
    this.setState({ wallpaper: firstWallpaperImage });
  };

  onAddItem = () => {
    this.handleCloseModal();

    const reducedFurnitures = furnitures.results.filter(
      (furniture) => furniture.category !== "Wall-mounted"
    );
    const shuffledFurnitures = reducedFurnitures.sort(
      () => 0.5 - Math.random()
    );
    const randomFurniture = shuffledFurnitures[0];

    if (this.state.searchedFurnitures.length !== 0) {
      const searchedFurniture = this.state.searchedFurnitures[0];
      
      this.setState((prevState) => {
        let objects = Object.assign({}, prevState.objects);
        objects[searchedFurniture.name] = searchedFurniture;
        return { objects };
      });
      this.setState({
        layout: this.state.layout.concat({
          i: searchedFurniture.content.name,
          x: 0,
          y: 0,
          w: searchedFurniture.content.size.cols,
          h: searchedFurniture.content.size.rows,
        }),
      });

    } else {
      this.setState((prevState) => {
        let objects = Object.assign({}, prevState.objects);
        objects[randomFurniture.name] = randomFurniture;
        return { objects };
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


  };

  onRemoveItem(i) {
    this.setState({ layout: _.reject(this.state.layout, { i: i }) });
  }

  async onRotateItem(i) {
    let layoutElement = this.state.layout.find(element => element.i === i);
    const rotatedLayoutElement = {i, x: layoutElement.x, y: layoutElement.y, w: layoutElement.h, h: layoutElement.w};

    await this.setState({ layout: _.reject(this.state.layout, { i: i }) });

    this.setState({
      layout: this.state.layout.concat(rotatedLayoutElement)
    });
  }

  onSwitchItem(i, direction) {
    if (this.state.objects[i].variations.length === 0) {
      return;
    }

    if (direction === "right") {
      this.setState((prevState) => {
        let variations = Object.assign({}, prevState.variations);
        variations[i] =
          ((prevState.variations[i] ? prevState.variations[i] : 0) + 1) %
          this.state.objects[i].variations.length;
        return { variations };
      });
    } else if (direction === "left") {
      this.setState((prevState) => {
        let variations = Object.assign({}, prevState.variations);
        variations[i] = prevState.variations[i]
          ? prevState.variations[i] - 1
          : this.state.objects[i].variations.length - 1;
        return { variations };
      });
    }
  }

  onLayoutChange = (layout) => {
    /*eslint no-console: 0*/
    this.setState({ layout });
    this.props.onLayoutChange(layout); // updates status display
  };

  handleOpenModal = () => {
    this.setState({ showModal: true });
  };

  handleCloseModal = () => {
    this.setState({ showModal: false });
  };

  handleChange = (event) => {
    const searchedFurnitures = furnitures.results.filter((furniture) =>
      furniture.content.name
        .toLowerCase()
        .includes(event.target.value.toLowerCase())
    );
    this.setState({value: event.target.value, searchedFurnitures});
  };

  handleChangeWallpaper = (event) => {
    this.setState({ wallpaper: event.target.value })
  };

  handleChangeFloor = (event) => {
    this.setState({ floor: event.target.value })
  };

  renderControls = () => {
    return (
      <div>
        <button onClick={this.resetLayout}>Reset</button>
        <button onClick={() => this.setState({ locked: !this.state.locked })}>
          {this.state.locked ? "Unlock" : "Lock"}
        </button>
        <select
          value={this.state.wallpaper}
          onChange={this.handleChangeWallpaper}
        >
          {wallpaper
            .sort((a, b) => (a.name > b.name ? 1 : -1))
            .map((wallpaper) => (
              <option value={wallpaper.image}>{wallpaper.name}</option>
            ))}
        </select>
        <select value={this.state.floor} onChange={this.handleChangeFloor}>
          {floors.results
            .sort((a, b) => (a.name > b.name ? 1 : -1))
            .map((floor) => (
              <option value={floor.image}>{floor.name}</option>
            ))}
        </select>
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
              backgroundImage: `url(${
                this.state.searchedFurnitures.length !== 0
                  ? this.state.searchedFurnitures[0].content.image
                  : "https://acnhcdn.com/latest/FtrIcon/FtrIllumiPresent_Remake_0_0.png"
              })`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100%",
              className: "tooltip",
            }}
          />
          <button onClick={this.onAddItem}>
            Add{" "}
            {this.state.searchedFurnitures.length !== 0
              ? this.state.searchedFurnitures[0].name
              : "Random Item"}
          </button>
          <div style={{ display: "flex" }}>
            {this.state.showModal && this.state.searchedFurnitures.length !== 0
              ? this.state.searchedFurnitures
                  .slice(0, 10)
                  .map((furniture) => (
                    <img
                      src={furniture.content.image}
                      onClick={(prevState) =>
                        this.setState({ searchedFurnitures: [furniture] })
                      }
                    />
                  ))
              : null}
          </div>
          <input
            type="text"
            placeholder="Type an item"
            style={{ margin: 5 }}
            value={this.state.value}
            onChange={this.handleChange}
          />
        </div>
      </div>
    );
  };

  renderItemControls = (el) => {
    return (
      <div>
        {el.h / el.w !== 1 ? (
          <span
            className="rotate"
            onClick={this.onRotateItem.bind(this, el.i)}
            style={{
              position: "absolute",
              left: "2px",
              top: 0,
              cursor: "pointer",
            }}
          >
            ↻
          </span>
        ) : null}
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
        {this.state.objects[el.i].variations.length !== 0 ? (
          <div>
            <span
              className="left"
              onClick={this.onSwitchItem.bind(this, el.i, "left")}
              style={{
                position: "absolute",
                left: "2px",
                bottom: 0,
                cursor: "pointer",
              }}
            >
              ←
            </span>
            <span
              className="right"
              onClick={this.onSwitchItem.bind(this, el.i, "right")}
              style={{
                position: "absolute",
                right: "2px",
                bottom: 0,
                cursor: "pointer",
              }}
            >
              →
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  renderGrid = () => {
    return (
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
          isDraggable={!this.state.locked}
          margin={[0, 0]}
          onLayoutChange={this.onLayoutChange}
        >
          {this.state.layout.map((el) => (
            <div key={el.i}>
              <div className="tooltip">
                {/* FIXME: Add back tooltip and item controls */}
                {/* {this.state.locked ? null : (
                  <span className="tooltiptext">{el.i}</span>
                )}
                {this.state.locked ? null : this.renderItemControls(el)} */}
                <div
                  style={{
                    height: 50 * el.h,
                    width: 50 * el.w,
                    backgroundImage: `url(${
                      this.state.variations[el.i]
                        ? this.state.objects[el.i].variations[
                            this.state.variations[el.i]
                          ].content.image
                        : this.state.objects[el.i].content.image
                    })`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "100%",
                  }}
                />
              </div>
            </div>
          ))}
        </GridLayout>
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: "url(https://i.imgur.com/xzTvv8z.png)",
            backgroundSize: 50,
            height: "100vh",
          }}
        >
          <div style={{ position: "absolute", top: 0, marginTop: 25, display: 'flex', flexDirection: 'column' }}>
            <button
              onClick={this.handleOpenModal}
            >
              Settings
            </button>
            <input type="range" min={-45} max={45} value={this.state.rotateX} onChange={(e) => this.setState({rotateX: e.target.value})}/>
            <input type="range" min={-45} max={45} value={this.state.rotateY} onChange={(e) => this.setState({rotateY: e.target.value})}/>
            <input type="range" min={-180} max={180} value={this.state.rotateZ} onChange={(e) => this.setState({rotateZ: e.target.value})}/>
          </div>
          <div
            style={{ position: "absolute", bottom: 0 }}
          >
            {this.renderControls()}
          </div>
          <div className="scene" style={{ position: "absolute" }}>
            <div className="cube" style={{ transform: `rotateX(${this.state.rotateX}deg) rotateY(${this.state.rotateY}deg) rotateZ(${this.state.rotateZ}deg)` }}>
              {/* <div className="cube__face cube__face--front">front</div> */}
              <div className="cube__face cube__face--back">{this.renderGrid()}</div>
              <div
                className="cube__face cube__face--right"
                style={{
                  backgroundImage: `url(${this.state.wallpaper})`,
                  backgroundSize: "50%",
                }}
              />
              <div
                className="cube__face cube__face--left"
                style={{
                  backgroundImage: `url(${this.state.wallpaper})`,
                  backgroundSize: "50%",
                }}
              />
              <div
                className="cube__face cube__face--top"
                style={{
                  backgroundImage: `url(${this.state.wallpaper})`,
                  backgroundSize: "50%",
                }}
              />
              <div
                className="cube__face cube__face--bottom"
                style={{
                  backgroundImage: `url(${this.state.wallpaper})`,
                  backgroundSize: "50%",
                }}
              />
            </div>
          </div>

          <Modal isOpen={this.state.showModal} contentLabel="Settings">
            {this.renderControls()}
            <button onClick={this.handleCloseModal}>Close Settings</button>
          </Modal>
        </div>
      </div>
    );
  }
}

export default App;