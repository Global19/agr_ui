import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import MethodHeader from './methodHeader';
import MethodCell from './methodCell';
import BooleanCell from './booleanCell';
import {
  getOrthologSpeciesId,
  getOrthologSpeciesName,
  getOrthologId,
  getOrthologSymbol,
} from './utils';
import { sortBy, compareByFixedOrder } from '../../lib/utils';
import { TAXON_ORDER } from '../../constants';
import HelpPopup from '../helpPopup';

const columns = [
  {name: 'Species'},
  {name: 'Gene symbol'},
  {name: 'Count'},
  {name: 'Best', help: 'Within this species, this gene is called as an ortholog of the input gene by the highest number of algorithms.'},
  {name: 'Best reverse', help: 'Within the species of the input gene, the input gene is called as an ortholog of this gene by the highest number of algorithms.'},
  {name: 'Method'}
];

export function isBest(value = '') {
  return typeof value === 'boolean' ? value : value.match(/yes/i);
}

class OrthologyTable extends Component {

  render() {
    let rowGroup = 0;
    return(
      <table className='table'>
        <thead>
          <tr>
            {
              columns.map((column) => {
                if (column.name === 'Method') {
                  return (<MethodHeader key={column.name} name={column.name} />);
                } else {
                  return (<th key={column.name}>
                    {column.name} {column.help && <HelpPopup id={`help-${column.name}`}>{column.help}</HelpPopup>}
                  </th>);
                }
              })
            }
          </tr>
        </thead>
        <tbody>
          {
            sortBy(this.props.data, [
              compareByFixedOrder(TAXON_ORDER, o => getOrthologSpeciesId(o)),
              (orthDataA, orthDataB) => orthDataB.predictionMethodsMatched.length - orthDataA.predictionMethodsMatched.length
            ]).map((orthData, idx, orthList) => {
              const scoreNumerator = orthData.predictionMethodsMatched.length;
              const scoreDemominator = scoreNumerator +
                orthData.predictionMethodsNotMatched.length;
              const orthId = getOrthologId(orthData);

              if (idx > 0 && getOrthologSpeciesName(orthList[idx - 1]) !== getOrthologSpeciesName(orthData)) {
                rowGroup += 1;
              }

              return (
                <tr key={orthId} style={{backgroundColor: rowGroup % 2 === 0 ? '#eee' : ''}} >
                  <td style={{fontStyle: 'italic'}}>{getOrthologSpeciesName(orthData)}</td>
                  <td>
                    <Link to={`/gene/${orthId}`}>{getOrthologSymbol(orthData)}</Link>
                  </td>
                  <td>{`${scoreNumerator} of ${scoreDemominator}`}</td>
                  <BooleanCell
                    isTrueFunc={isBest}
                    value={orthData.best}
                  />
                  <BooleanCell
                    isTrueFunc={isBest}
                    value={orthData.bestReverse}
                  />
                  <MethodCell
                    predictionMethodsMatched={orthData.predictionMethodsMatched}
                    predictionMethodsNotMatched={orthData.predictionMethodsNotMatched}
                    rowKey={orthId}
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
  data: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.shape({
        id: PropTypes.string,
        symbol: PropTypes.string,
        species: PropTypes.shape({
          name: PropTypes.string,
        }),
      }),
      predictionMethodsMatched: PropTypes.arrayOf(PropTypes.string),
      predictionMethodsNotCalled: PropTypes.arrayOf(PropTypes.string),
      predictionMethodsNotMatched: PropTypes.arrayOf(PropTypes.string),
      best: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string
      ]),
      bestReverse: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string
      ]),
    })
  )
};

export default OrthologyTable;
