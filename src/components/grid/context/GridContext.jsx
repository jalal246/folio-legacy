import React, { createContext } from 'react';

const GridController = createContext();

export const { Consumer: GridConsumer } = GridController;

export class GridProvider extends React.Component {
  constructor(props) {
    super(props);

    this.cellCounter = 0;

    // comes from user by GridItem
    this.biggestColItem = 0;
    this.biggestRowItem = 0;

    // comes from user by Grid
    this.fixedCol = 0;
    this.fixedRow = 0;

    this.rowCellsWidth = {};
    this.colCellsWidth = {};

    this.didMount = false;
    this.isDynamicTempRow = false;
    this.isDynamicTempCol = false;

    this.state = {
      isDynamicTempCol: false,
      rowCellsWidth: {},
      biggestCol: 0,

      isDynamicTempRow: false,
      colCellsWidth: {},
      biggestRow: 0,

      isDynamic: false
    };
  }

  componentDidMount() {
    this.didMount = true;

    if (!this.isDynamicTempCol && !this.isDynamicTempRow) {
      // we've got nothing from gid items
      // dont update the state
      return;
    }
    this.updateState();
  }

  getCellCounter = () => this.cellCounter;

  updateState = () => {
    console.log('updateState');

    let biggestRow = this.fixedRow;

    if (
      this.biggestRowItem > this.cellCounter &&
      this.biggestRowItem > this.fixedRow
    ) {
      biggestRow = this.biggestRowItem;
    } else if (this.cellCounter > this.fixedRow) {
      biggestRow = this.cellCounter;
    }

    const biggestCol =
      this.biggestColItem > this.fixedCol ? this.biggestColItem : this.fixedCol;

    this.setState({
      isDynamicTempCol: this.isDynamicTempCol,
      rowCellsWidth: this.rowCellsWidth,
      biggestCol,

      isDynamicTempRow: this.isDynamicTempRow,
      colCellsWidth: this.colCellsWidth,
      biggestRow,

      isDynamic: true
    });
  };

  registerCellContainer = (row, toRow, rowWidth, col, toCol, colWidth) => {
    // if (this.didMount) return;
    console.log('registerCellContainer');
    // count cells
    this.cellCounter += 1;

    // find out the biggest column number
    // this hepls to know how many columns do we have
    if (col > toCol && col > this.biggestColItem) {
      this.biggestColItem = col;
    } else if (toCol > this.biggestColItem) {
      this.biggestColItem = toCol;
    }

    // find out the biggest row number
    // this hepls to know how many rows do we have
    if (row > toRow && row > this.biggestRowItem) {
      this.biggestRowItem = row;
    } else if (toRow > this.biggestRowItem) {
      this.biggestRowItem = toRow;
    } else {
      /*
      * we can count rows automatically
      * increasing one for each call
      * relying on column zero 0
      */
      this.biggestRowItem += 1;
    }

    // if we have row width
    if (rowWidth) {
      // we check if this is the first time

      if (!this.isDynamicTempRow) {
        // if it is, then set row width flag
        this.isDynamicTempRow = true;
      }
      /*
        we accept row width without knowing the row number
        this should be easy guess, since we count each cell counter
      */
      this.rowCellsWidth[row || this.cellCounter] = rowWidth;
    }

    /*
      support default column, as zero index
    */
    if (colWidth) {
      if (!this.isDynamicTempCol) {
        this.isDynamicTempCol = true;
      }
      if (!col) {
        // if no column and column 0 is not set
        if (!this.colCellsWidth[0]) {
          this.colCellsWidth[0] = colWidth;
        }
      } else {
        this.colCellsWidth[col] = colWidth;
      }
    }
  };

  updateRowColNumber = (row, col) => {
    /*
    * This function will be called everytime Grid render
    * updating values without checking if the values new
    * will cause unnecessary render
    */
    if (this.fixedRow === row && this.fixedCol === col) {
      return;
    }

    // assign new values
    this.fixedRow = row;
    this.fixedCol = col;

    /*
    * if this function called when initiation
    * then dont trigger update
    * beacuse it will be handled by componentDidMount
    *
    * otherwise it comes from change happened in Grid
    * this must trigger update the state
    */
    if (this.didMount) {
      this.updateState();
    }
  };

  render() {
    console.log('GridProvider update');

    const {
      isDynamicTempCol,
      rowCellsWidth,
      biggestCol,

      isDynamicTempRow,
      colCellsWidth,
      biggestRow,

      isDynamic
    } = this.state;

    const { children } = this.props;

    const { registerCellContainer, updateRowColNumber, getCellCounter } = this;

    return (
      <GridController.Provider
        value={{
          cnValues: {
            isDynamicTempCol,
            rowCellsWidth,
            biggestCol,

            isDynamicTempRow,
            colCellsWidth,
            biggestRow,

            isDynamic
          },

          cnFuncs: {
            registerCellContainer,
            updateRowColNumber,
            getCellCounter
          }
        }}
      >
        {children}
      </GridController.Provider>
    );
  }
}
