import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  AttributeList,
  AttributeLabel,
  AttributeValue,
} from '../../components/attribute';
import numeral from 'numeral';
import ExternalLink from '../../components/ExternalLink';
import GenomeFeatureViewer from 'agr_genomefeaturecomponent';
import {getTranscriptTypes} from '../../lib/genomeFeatureTypes';
import LoadingSpinner from '../../components/loadingSpinner';
import '../../style.scss';
import HorizontalScroll from '../../components/horizontalScroll';
import HelpPopup from '../../components/helpPopup';
import isEqual from 'lodash.isequal';
import CommaSeparatedList from '../../components/commaSeparatedList';

import style from './style.scss';
import {getSpecies} from '../../lib/utils';

const APOLLO_SERVER_PREFIX = '/apollo/';
const LINK_BUFFER = 1.2;

class GenomeFeatureWrapper extends Component {

  constructor(props) {
    super(props);

    this.state = {
      loadState: 'loading',
      helpText: ''
    };

    this.trackDataUrl = APOLLO_SERVER_PREFIX + 'track/';
    this.variantDataUrl = APOLLO_SERVER_PREFIX + 'vcf/';
  }


  componentDidMount() {
    this.loadGenomeFeature();
  }

  componentDidUpdate(prevProps) {
    if (this.props.primaryId !== prevProps.primaryId) {
      this.loadGenomeFeature();
      this.gfc.setSelectedAlleles(this.props.allelesSelected!==undefined ? this.props.allelesSelected:[],`#${this.props.id}`);
    }
    else
    if(!isEqual(prevProps.allelesSelected,this.props.allelesSelected) && this.props.allelesSelected!==undefined) {
      this.loadGenomeFeature();
      this.gfc.setSelectedAlleles(this.props.allelesSelected.map( a => a.id),`#${this.props.id}`);
    }
    else
    if(!isEqual(prevProps.visibleVariants,this.props.visibleVariants)) {
      this.loadGenomeFeature();
    }
  }

  componentWillUnmount() {
    this.gfc.closeModal();
  }

  generateJBrowseLink(chr, start, end) {
    const geneSymbolUrl = '&lookupSymbol=' + this.props.geneSymbol;
    const externalJBrowsePrefix = '/jbrowse/?' + 'data=data%2F' + encodeURIComponent(getSpecies(this.props.species).jBrowseName);
    const linkLength = end - start;
    let bufferedMin = Math.round(start - (linkLength * LINK_BUFFER / 2.0));
    bufferedMin = bufferedMin < 0 ? 0 : bufferedMin;
    const bufferedMax = Math.round(end + (linkLength * LINK_BUFFER / 2.0));
    const externalLocationString = chr + ':' + bufferedMin + '..' + bufferedMax;
    // TODO: handle bufferedMax exceeding chromosome length, though I think it has a good default.
    const tracks = ['Variants', 'All Genes','Multiple-Variant Alleles'];
    return externalJBrowsePrefix +
      '&tracks=' + encodeURIComponent(tracks.join(',')) +
      '&highlight=' + geneSymbolUrl +
      '&loc=' + encodeURIComponent(externalLocationString);
  }

  generateTrackConfig(fmin, fmax, chromosome, species, nameSuffixString, variantFilter, displayType) {
    let transcriptTypes = getTranscriptTypes();
    const speciesInfo = getSpecies(species);
    const apolloPrefix = speciesInfo.apolloName;
    if(species === 'NCBITaxon:2697049'){
      const padding = Math.round((fmax-fmin)*0.2);
      fmin = (fmin - padding) > 1 ? fmin - padding : 1;
      fmax = (fmax + padding);
    }
    if (displayType === 'ISOFORM') {
      return {
        'locale': 'global',
        'chromosome': apolloPrefix==='yeast' ? 'chr' +chromosome : chromosome,
        'start': fmin,
        'end': fmax,
        'transcriptTypes': transcriptTypes,
        'tracks': [
          {
            'id': 1,
            'genome': apolloPrefix,
            'type': 'ISOFORM',
            'url': [
              this.trackDataUrl,
              speciesInfo.apolloTrack,
              `.json${nameSuffixString}&ignoreCache=true${speciesInfo.suppressFlatten ? '&flatten=false' : ''}`
            ]
          },
        ]
      };
    } else if (displayType === 'ISOFORM_AND_VARIANT') {
      return {
        'locale': 'global',
        'chromosome': chromosome,
        'start': fmin,
        'end': fmax,
        'showVariantLabel': false,
        'variantFilter': variantFilter ? variantFilter : [],
        'visibleVariants': undefined,
        'binRatio': 0.01,
        'transcriptTypes': transcriptTypes,
        'tracks': [
          {
            'id': 1,
            'genome': apolloPrefix,
            'type': 'ISOFORM_AND_VARIANT',
            'isoform_url': [
              this.trackDataUrl,
              '/All%20Genes/',
              `.json${nameSuffixString}`
            ],
            'variant_url': [
              this.variantDataUrl,
              '/Variants/',
              '.json'
            ],

          },
        ]
      };
    } else {
      // eslint-disable-next-line no-console
      console.error('Undefined displayType', displayType);
    }
  }

  loadGenomeFeature() {
    const {chromosome, fmin, fmax, species, id, primaryId, geneSymbol, displayType, synonyms = [], visibleVariants} = this.props;

    // provide unique names
    let nameSuffix = [geneSymbol, ...synonyms, primaryId].filter((x, i, a) => a.indexOf(x) === i).map(x => encodeURI(x));
    if(getSpecies(species).apolloName==='SARS-CoV-2'){
      if(primaryId && primaryId.indexOf(':')>0){
        const baseId = primaryId.split(':')[1];
        nameSuffix.push(baseId);
        // add accession IDs as well
        nameSuffix.push(baseId+'.0');
        nameSuffix.push(baseId+'.1');
        nameSuffix.push(baseId+'.2');
        nameSuffix.push(baseId+'.3');
      }
    }
    let nameSuffixString = nameSuffix.length === 0 ? '' : nameSuffix.join('&name=');
    if (nameSuffixString.length > 0) {
      nameSuffixString = `?name=${nameSuffixString}`;
    }

    // resolved in GenomeFeaturesViewer widget as:
    // var dataUrl = track["url"][0] + encodeURI(track["genome"]) + track["url"][1] + encodeURI(externalLocationString) + track["url"][2];
    // https://agr-apollo.berkeleybop.io/apollo/track/Mus%20musculus/All%20Genes/2:105668900..105697364.json?name=MGI:97490&name=Pax6
    // [0] should be apollo_url: https://agr-apollo.berkeleybop.io/apollo/track
    // [1] should be track name : ALL_Genes
    // [2] should be track name : name suffix string
    // const visibleVariants = allelesVisible && allelesVisible.length>0 ? allelesVisible.map( a => a.id ) : undefined;
    const trackConfig = this.generateTrackConfig(fmin, fmax, chromosome, species, nameSuffixString, visibleVariants, displayType);
    this.gfc = new GenomeFeatureViewer(trackConfig, `#${id}`, 900, undefined);
    this.setState({
      helpText: this.gfc.generateLegend()
    });
  }

  render() {
    const {assembly, id, displayType,genomeLocationList} = this.props;
    const coordinates = genomeLocationList.map(location => {
      return(
        <span key={location.chromosome+location.start+location.end}>
          <ExternalLink href={this.generateJBrowseLink(location.chromosome,location.start,location.end)}>
            {location.chromosome.toLowerCase().startsWith('chr') ? location.chromosome : 'Chr' + location.chromosome}:{location.start}...{location.end}
          </ExternalLink> {location.strand} ({numeral((location.end - location.start) / 1000.0).format('0,0.00')} kb)
        </span>
      );
    });

    return (
      <div id='genomeViewer'>
        <AttributeList>
          <AttributeLabel>Genome location</AttributeLabel>
          <AttributeValue>
            <CommaSeparatedList>{coordinates}</CommaSeparatedList>
          </AttributeValue>
          <AttributeLabel>Assembly version</AttributeLabel>
          <AttributeValue>{assembly}
          </AttributeValue>
        </AttributeList>

        <HorizontalScroll width={960}>
          <div>
            <svg id={id}>
              <LoadingSpinner/>
            </svg>
          </div>
          {displayType === 'ISOFORM_AND_VARIANT' &&
          <div>
            <span className='mr-1'>Variant Types and Consequences</span>
            <HelpPopup
              id='variant-legend'
              placement='bottom-start'
              popperClassName={style.variantLegendPopper}
            >
              <span dangerouslySetInnerHTML={{__html: this.state.helpText}}/>
            </HelpPopup>
          </div>
          }
          {this.state.loadState === 'error' ?
            <div className='text-danger'>Unable to retrieve data</div> : ''}
        </HorizontalScroll>
      </div>
    );
  }


}

GenomeFeatureWrapper.propTypes = {
  allelesSelected: PropTypes.array,
  assembly: PropTypes.string,
  biotype: PropTypes.string,
  chromosome: PropTypes.string,
  displayType: PropTypes.string,
  fmax: PropTypes.number,
  fmin: PropTypes.number,
  geneSymbol: PropTypes.string.isRequired,
  genomeLocationList: PropTypes.array,
  height: PropTypes.string,
  id: PropTypes.string,
  primaryId: PropTypes.string,
  species: PropTypes.string.isRequired,
  strand: PropTypes.string,
  synonyms: PropTypes.array,
  visibleVariants: PropTypes.array,
  width: PropTypes.string,

};

export default GenomeFeatureWrapper;
