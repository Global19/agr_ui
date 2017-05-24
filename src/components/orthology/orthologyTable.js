import React, { Component } from 'react';
import { Link } from 'react-router';
import MethodHeader from './methodHeader';
import MethodCell from './methodCell';
import BooleanCell from './booleanCell';

const columnNames = ['Species', 'Gene symbol', 'Score',
  'Best score', 'Best reverse score', 'Method'];

const speciesOrder = [
  'H. sapiens',
  'M. musculus',
  'R. norvegicus',
  'D. rerio',
  'D. melanogaster',
  'C. elegans',
  'S. cerevisiae'
];

const getSpeciesOrderScore = (speciesName) => {
  const speciesIndex = speciesOrder.indexOf(speciesName);
  return speciesIndex === -1 ? speciesOrder.length : speciesIndex;
};

class OrthologyTable extends Component {

  render() {
    return(
      <table className='table'>
        <thead>
          <tr>
          {
            columnNames.map((columnName) => {
              if (columnName === 'Method') {
                return (<MethodHeader key={columnName} name={columnName} />);
              } else {
                return (<th key={columnName}>{columnName}</th>);
              }
            })
          }
          </tr>
        </thead>
        <tbody>
        {
          this.props.data.sort((orthDataA, orthDataB) => {
            const speciesOrderDelta = getSpeciesOrderScore(orthDataA.gene2SpeciesName) -
              getSpeciesOrderScore(orthDataB.gene2SpeciesName);
            return speciesOrderDelta === 0 ?
              (orthDataB.predictionMethodsMatched.length) - (orthDataA.predictionMethodsMatched.length) :
              speciesOrderDelta;
          }).map((orthData) => {
            const scoreNumerator = orthData.predictionMethodsMatched.length;
            const scoreDemominator = scoreNumerator +
              orthData.predictionMethodsNotCalled.length +
              orthData.predictionMethodsNotMatched.length;

            const rowStyle = getSpeciesOrderScore(orthData.gene2SpeciesName) % 2 === 0 ?
              {backgroundColor: '#eee'} : {};
            return (
              <tr key={`${orthData.gene2AgrPrimaryId}`} style={rowStyle} >
                <td>{orthData.gene2SpeciesName}</td>
                <td>
                  <Link to={`/gene/${orthData.gene2AgrPrimaryId}`}>{orthData.gene2Symbol}</Link>
                </td>
                <td>{`${scoreNumerator} of ${scoreDemominator}`}</td>
                <BooleanCell
                  isTrueFunc={(value) => value === 'Yes'}
                  value={orthData.isBestScore}
                />
                <BooleanCell
                  isTrueFunc={(value) => value === 'Yes'}
                  value={orthData.isBestRevScore}
                />
                <MethodCell
                  predictionMethodsMatched={orthData.predictionMethodsMatched}
                  predictionMethodsNotMatched={orthData.predictionMethodsNotMatched}
                />
              </tr>
            );
          })
        }
        </tbody>
      </table>
    );
  }
}

OrthologyTable.propTypes = {
  data: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      gene2AgrPrimaryId: React.PropTypes.string,
      gene2Symbol: React.PropTypes.string,
      gene2Species: React.PropTypes.number,
      gene2SpeciesName: React.PropTypes.string,
      predictionMethodsMatched: React.PropTypes.arrayOf(React.PropTypes.string),
      predictionMethodsNotCalled: React.PropTypes.arrayOf(React.PropTypes.string),
      predictionMethodsNotMatched: React.PropTypes.arrayOf(React.PropTypes.string),
      isBestScore: React.PropTypes.bool,
      isBestRevScore: React.PropTypes.bool,
    })
  )
};

export default OrthologyTable;
