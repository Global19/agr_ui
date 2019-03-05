/* eslint-disable react/no-set-state */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { fetchPhenotypes } from '../../actions/genes';
import { selectPhenotypes } from '../../selectors/geneSelectors';
import { RemoteDataTable, ReferenceCell, GeneticEntityCell } from '../../components/dataTable';

class PhenotypeTable extends React.Component {
  loadPhenotypes(opts) {
    const { dispatch, geneId } = this.props;
    dispatch(fetchPhenotypes(geneId, opts));
  }

  render() {
    const { geneId, phenotypes } = this.props;

    const data = phenotypes.data && phenotypes.data.map(record => {
      return {
        id: record.geneticEntity.id + '-' + record.phenotype,
        phenotype: record.phenotype,
        geneticEntity: record.geneticEntity,
        geneticEntityType: record.geneticEntity.type,
        reference: record.publications,
      };
    });

    const columns = [
      {
        dataField: 'id',
        text: 'id',
        hidden: true,
      },
      {
        dataField: 'phenotype',
        text: 'Phenotype Term',
        formatter: (term) => <span dangerouslySetInnerHTML={{__html: term}} />,
        // style: {width: '120px'},
        headerStyle: {width: '120px'}
      },
      {
        dataField: 'geneticEntity',
        text: 'Genetic Entity',
        formatter: entity => entity.type === 'gene' ? null : GeneticEntityCell(entity),
        headerStyle: {width: '185px'},
      },
      {
        dataField: 'geneticEntityType',
        text: 'Genetic Entity Type',
        headerStyle: {width: '100px'},
      },
      {
        dataField: 'reference',
        text: 'References',
        formatter: ReferenceCell,
        headerStyle: {width: '150px'},
      },
    ];
    return (
      <RemoteDataTable
        columns={columns}
        data={data}
        downloadUrl={`/api/gene/${geneId}/phenotypes/download`}
        keyField='id'
        loading={phenotypes.loading}
        onUpdate={this.loadPhenotypes.bind(this)}
        totalRows={phenotypes.total}
      />
    );
  }
}

PhenotypeTable.propTypes = {
  dispatch: PropTypes.func,
  geneId: PropTypes.string.isRequired,
  phenotypes: PropTypes.object,
};

function mapStateToProps (state) {
  return {
    phenotypes: selectPhenotypes(state),
  };
}

export default connect(mapStateToProps)(PhenotypeTable);
