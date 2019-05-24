import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  DiseaseNameCell,
  GeneticEntityCell,
  EvidenceCodesCell,
  ReferenceCell,
  RemoteDataTable
} from '../../components/dataTable';
import { selectDiseaseViaEmpirical } from '../../selectors/geneSelectors';
import { fetchDiseaseViaEmpirical } from '../../actions/genes';
import { fetchDiseaseSummary } from '../../actions/disease';
import { selectSummary } from '../../selectors/diseaseSelectors';
import ExternalLink from '../externalLink';

// import GenericRibbon from '@geneontology/ribbon';
// import axios from 'axios';

class GenePageDiseaseTable extends Component {

  loadData(opts) {
    const { dispatch, geneId } = this.props;
    dispatch(fetchDiseaseViaEmpirical(geneId, opts));
    // this.fetchData(geneId)
    //   .then(data => {
    //     console.log('retrieved: ', data);
    //   });
  }

  // fetchData(geneId) {
  //   let query = 'https://build.alliancegenome.org/api/gene/' + geneId + '/disease-ribbon-summary';
  //   console.log('Query is ' + query);
  //   return axios.get(query);
  // }

  componentDidMount() {
    const { dispatch, geneId, summary } = this.props;
    if (!summary) {
      dispatch(fetchDiseaseSummary(geneId));
      console.log('disease - summary: ' , this.props);
    }
  }
    

  render() {
    const { diseases, geneId } = this.props;

    console.log('disease - render: ' , this.props);

    const data = diseases.data && diseases.data.map(annotation => ({
      id: `${annotation.disease.id}-${annotation.allele ? annotation.allele.id : ''}`,
      disease: annotation.disease,
      geneticEntity: annotation.allele,
      associationType: annotation.associationType.replace(/_/g, ' '),
      geneticEntityType: annotation.geneticEntityType,
      source: annotation.source,
      evidenceCodes: annotation.evidenceCodes,
      publications: annotation.publications,
    }));

    const columns = [
      {
        dataField: 'id',
        text: 'id',
        hidden: true,
      },
      {
        dataField: 'disease',
        text: 'Disease',
        formatter: DiseaseNameCell,
        filterable: true,
        headerStyle: {width: '150px'},
      },
      {
        dataField: 'geneticEntity',
        text: 'Genetic Entity',
        formatter: GeneticEntityCell,
        filterable: true,
        headerStyle: {width: '185px'},
      },
      {
        dataField: 'geneticEntityType',
        text: 'Genetic Entity Type',
        filterable: ['allele', 'gene'],
        headerStyle: {width: '110px'},
      },
      {
        dataField: 'associationType',
        text: 'Association',
        filterable: true,
        headerStyle: {width: '120px'},
      },
      {
        dataField: 'evidenceCodes',
        text: 'Evidence Code',
        formatter: EvidenceCodesCell,
        filterable: true,
        headerStyle: {width: '75px'},
      },
      {
        dataField: 'source',
        text: 'Source',
        formatter: ({name, url}) => <ExternalLink href={url}>{name}</ExternalLink>,
        filterable: true,
        headerStyle: {width: '85px'},
      },
      {
        dataField: 'publications',
        text: 'References',
        formatter: ReferenceCell,
        filterable: true,
        headerStyle: {width: '150px'},
      }
    ];

    const sortOptions = [
      {value: 'disease', label: 'Disease'},
      {value: 'geneticEntity', label: 'Genetic Entity'}
    ];

    return (
      <RemoteDataTable
        columns={columns}
        data={data}
        downloadUrl={`/api/gene/${geneId}/diseases-by-experiment/download`}
        keyField='id'
        loading={diseases.loading}
        onUpdate={this.loadData.bind(this)}
        sortOptions={sortOptions}
        totalRows={diseases.total}
      />
    );
  }
}

GenePageDiseaseTable.propTypes = {
  diseases: PropTypes.object,
  dispatch: PropTypes.func,
  filename: PropTypes.string,
  geneId: PropTypes.string.isRequired,
};

const mapStateToProps = (state, props) => ({
  diseases: selectDiseaseViaEmpirical(state),
  summary: selectSummary(props.geneId)(state)
});

export default connect(mapStateToProps)(GenePageDiseaseTable);
