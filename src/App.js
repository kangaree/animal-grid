import React from 'react';
import './App.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';

import GridLayout from "react-grid-layout";

import furnitures from './data/furnitures.json';
import floors from './data/floors.json';
import wallpaper from './data/wallpaper.json';
import villagers from './data/villagers.json';
import { AnimalData as animalHouses } from './data/animalHouse';

import _ from "lodash";

import Modal from "react-modal";

import ArrowKeysReact from "arrow-keys-react";

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
      floor: "/images/floors/RoomTexFloorCommon00.png",
      // wallpaper: "/images/wallpaper/Wallpaper_common_wall.png",
      wallpaper: "/images/wallpaper/Wallpaper_office_wall.png",
      locked: false,
      searchValue: "",
      searchedFurnitures: [],
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      gridHeight: 12,
      gridWidth: 12,
      // gridDepth needs to be bumped to 8
      gridDepth: 8,
      gridSize: 25,
    };
    ArrowKeysReact.config({
      left: () => {
        this.setState((state) => {
          return { rotateZ: state.rotateZ - 90 };
        });
      },
      right: () => {
        this.setState((state) => {
          return { rotateZ: state.rotateZ + 90 };
        });
      },
      up: () => {
        this.setState((state) => {
          return { rotateX: Math.min( state.rotateX + 45, 90) };
        });
      },
      down: () => {
        this.setState((state) => {
          return { rotateX: Math.max( state.rotateX - 45, 0) };
        });
      },
    });

  }

  componentDidMount = () => {
    this.setVillagerLayout();
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
      w: furniture.content.size.cols * 2,
      h: furniture.content.size.rows * 2,
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

  setVillagerLayout = (index) => {
    this.handleCloseModal();

    let objects = {};

    const randomVillagerIndex = Math.floor(Math.random() * animalHouses.length);

    const villagerHouse = animalHouses[randomVillagerIndex];
    
    const villagerFloorImage = floors.results.find(
      (floor) => floor.internalID === villagerHouse.floor.id
      ).image;
      
      this.setState({floor: villagerFloorImage});
      
      const shuffledWallpaper = wallpaper.sort(() => 0.5 - Math.random());
      const firstWallpaperImage = shuffledWallpaper[0].image;
      this.setState({ wallpaper: firstWallpaperImage });
      
      const villagerItems = villagerHouse.items;
      // take out wall hanging items in north and west wall
      // const filteredItems = villagerItems.filter((item) => (item.x >= 0 && item.y >=0));
      // also take out items on top of things
      // TODO: items that are on top of tables (newtons cradle).
    const filteredItems = villagerItems.filter((item) => (item.x >= 0 && item.y >=0 && item.z === 0));

    let layoutFurnitures = filteredItems.map((villagerFurniture) => {
      
      const catalogFurniture = furnitures.results.find(
        (catalogFurniture) =>
          catalogFurniture.content.internalID === villagerFurniture.id
      );

      const repeatArray = filteredItems.filter(
        (catalogFurniture) =>
          catalogFurniture.id === villagerFurniture.id
      );

      const itemIndex = repeatArray.indexOf(villagerFurniture);

      const iName = catalogFurniture.name + '|' + itemIndex;

      objects[iName] = catalogFurniture;

      return {
        i: iName,
        // coordinates are flipped?
        x: villagerFurniture.y,
        y: villagerFurniture.x,
        // w: catalogFurniture.content.size.cols * 2,
        // h: catalogFurniture.content.size.rows * 2,
        w:
          villagerFurniture.width === 0
            ? catalogFurniture.content.size.cols * 2
            : villagerFurniture.width * 2,
        h:
          villagerFurniture.length === 0
            ? catalogFurniture.content.size.cols * 2
            : villagerFurniture.length * 2,
      };
    });

    const villager = villagers.find(
      (villager) => villager.name === villagerHouse.name
    );

    const villagerLayout = {
      i: villager.name,
      x: 5,
      y: 5,
      w: 2,
      h: 2,
    };

    layoutFurnitures = [...layoutFurnitures, villagerLayout];

    objects[villager.name] = { content: { image: villager.iconImage }, variations: [], type: "villager" };

    this.setState({ layout: layoutFurnitures, objects, villager });
  }

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

      const iName = searchedFurniture.name + "|" + Object.values(this.state.objects).filter((obj) => obj.id === searchedFurniture.id).length;
      
      this.setState((prevState) => {
        let objects = Object.assign({}, prevState.objects);
        objects[iName] = searchedFurniture;
        return { objects };
      });
      this.setState({
        layout: this.state.layout.concat({
          i: iName,
          x: 0,
          y: 0,
          w: searchedFurniture.content.size.cols * 2,
          h: searchedFurniture.content.size.rows * 2,
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
          w: randomFurniture.content.size.cols * 2,
          h: randomFurniture.content.size.rows * 2,
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
        <button onClick={this.resetLayout}>Random Layout</button>
        <button onClick={this.setVillagerLayout}>Set Villager</button>
        <button onClick={() => this.setState({ locked: !this.state.locked })}>
          {this.state.locked ? "Unlock" : "Lock"}
        </button>
        <input
          type="range"
          min={-45}
          max={45}
          value={this.state.rotateX}
          onChange={(e) => this.setState({ rotateX: e.target.value })}
        />
        <input
          type="range"
          min={-45}
          max={45}
          value={this.state.rotateY}
          onChange={(e) => this.setState({ rotateY: e.target.value })}
        />
        <input
          type="range"
          min={-180}
          max={180}
          value={this.state.rotateZ}
          onChange={(e) => this.setState({ rotateZ: e.target.value })}
        />
        <select
          value={this.state.wallpaper}
          onChange={this.handleChangeWallpaper}
        >
          {wallpaper
            .sort((a, b) => (a.name > b.name ? 1 : -1))
            .map((wallpaper) => (
              <option value={wallpaper.image} key={wallpaper.image}>
                {wallpaper.name}
              </option>
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
              height: this.state.gridSize,
              width: this.state.gridSize,
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
      <div style={{fontSize: 12, color: 'black'}}>
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
          width: this.state.gridWidth * this.state.gridSize,
          height: this.state.gridHeight * this.state.gridSize,
          backgroundImage: `url("${this.state.floor}")`,
          backgroundSize: this.state.gridSize * 2,
          // backgroundSize: "100%",
          backgroundRepeat: "space",
        }}
      >
        <GridLayout
          className="layout"
          layout={this.state.layout}
          cols={this.state.gridWidth}
          maxRows={this.state.gridHeight}
          rowHeight={this.state.gridSize}
          width={this.state.gridWidth * this.state.gridSize}
          compactType={null}
          isResizable={false}
          isDraggable={!this.state.locked}
          margin={[0, 0]}
          onLayoutChange={this.onLayoutChange}
          // ratio of "back" panel to layout size
          transformScale={272.73 / (this.state.gridWidth * this.state.gridSize)}
        >
          {this.state.layout.map((el) => (
            <div key={el.i}>
              <div className="tooltip">
                {this.state.locked ? null : (
                  <span className="tooltiptext">{el.i.split("|")[0]}</span>
                )}
                {this.state.locked ? null : this.renderItemControls(el)}
                <div
                  style={{
                    height: this.state.gridSize * el.h,
                    width: this.state.gridSize * el.w,
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
      <div className="App" {...ArrowKeysReact.events} tabIndex="1">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: "url(https://i.imgur.com/xzTvv8z.png)",
            backgroundSize: this.state.gridSize,
            height: "100vh",
          }}
        >
          <img
            style={{ position: "absolute", top: 0, marginTop: 25, height: 75 }}
            src={"/images/ui/AnimalGridTitle.png"}
          />
          <div
            className="scene"
            style={{
              position: "absolute",
              width: this.state.gridWidth * this.state.gridSize,
              height: this.state.gridHeight * this.state.gridSize,
            }}
          >
            <div
              className="cube"
              style={{
                transform: `rotateX(${this.state.rotateX}deg) rotateY(${this.state.rotateY}deg) rotateZ(${this.state.rotateZ}deg)`,
                width: this.state.gridWidth * this.state.gridSize,
                height: this.state.gridHeight * this.state.gridSize,
              }}
            >
              {/* <div className="cube__face cube__face--front">front</div> */}
              <div
                className="cube__face cube__face--back"
                style={{
                  width: this.state.gridWidth * this.state.gridSize,
                  height: this.state.gridHeight * this.state.gridSize,
                }}
              >
                {this.renderGrid()}
              </div>
              <div
                className="cube__face cube__face--right"
                style={{
                  backgroundImage: `url(${this.state.wallpaper})`,
                  backgroundSize: "33.33%",
                  opacity:
                    this.state.rotateZ % 360 !== 90 &&
                    this.state.rotateZ % 360 !== -270
                      ? 1
                      : this.state.rotateX === 90
                      ? 0
                      : this.state.rotateX === 45
                      ? 0.25
                      : 1,
                  height: this.state.gridDepth * this.state.gridSize,
                  width: this.state.gridWidth * this.state.gridSize,
                  transform: `rotateY(90deg) translateZ(${
                    (this.state.gridHeight * this.state.gridSize) / 2
                  }px) translateY(${
                    (this.state.gridHeight / 2 - 4) * this.state.gridSize
                  }px) rotateZ(-90deg)`,
                }}
              />
              <div
                className="cube__face cube__face--left"
                style={{
                  backgroundImage: `url(${this.state.wallpaper})`,
                  backgroundSize: "33.33%",
                  opacity:
                    this.state.rotateZ % 360 !== 270 &&
                    this.state.rotateZ % 360 !== -90
                      ? 1
                      : this.state.rotateX === 90
                      ? 0
                      : this.state.rotateX === 45
                      ? 0.25
                      : 1,
                  height: this.state.gridDepth * this.state.gridSize,
                  width: this.state.gridWidth * this.state.gridSize,
                  transform: `rotateY(-90deg) translateZ(${
                    (this.state.gridWidth * this.state.gridSize) / 2
                  }px) translateY(${
                    (this.state.gridHeight / 2 - 4) * this.state.gridSize
                  }px) rotateZ(90deg)`,
                }}
              />
              <div
                className="cube__face cube__face--top"
                style={{
                  backgroundImage: `url(${this.state.wallpaper})`,
                  backgroundSize: "33.33%",
                  opacity:
                    this.state.rotateZ % 360 !== 180 &&
                    this.state.rotateZ % 360 !== -180
                      ? 1
                      : this.state.rotateX === 90
                      ? 0
                      : this.state.rotateX === 45
                      ? 0.25
                      : 1,
                  height: this.state.gridDepth * this.state.gridSize,
                  width: this.state.gridWidth * this.state.gridSize,
                }}
              />
              <div
                className="cube__face cube__face--bottom"
                style={{
                  backgroundImage: `url(${this.state.wallpaper})`,
                  backgroundSize: "33.33%",
                  opacity:
                    this.state.rotateZ % 360 !== 0
                      ? 1
                      : this.state.rotateX === 90
                      ? 0
                      : this.state.rotateX === 45
                      ? 0.25
                      : 1,
                  height: this.state.gridDepth * this.state.gridSize,
                  width: this.state.gridWidth * this.state.gridSize,
                  transform: `rotateX(-90deg) translateZ(${
                    this.state.gridDepth * this.state.gridSize
                  }px)`,
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 0,
              marginBottom: 25,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <input
              type="image"
              onClick={this.handleOpenModal}
              src="/images/ui/Resetti.png"
              style={{
                height: this.state.gridSize * 2,
                width: this.state.gridSize * 2,
                margin: "auto",
              }}
            />
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