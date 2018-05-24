import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';

import style from './style.scss';

import {
  AttributeList,
  AttributeLabel,
  AttributeValue,
} from '../../components/attribute';
import ExternalLink from '../../components/externalLink';
import CrossReferenceList from '../../components/crossReferenceList';
import CommaSeparatedList from '../../components/commaSeparatedList';
import { CollapsibleList, CollapsibleListItem } from '../../components/collapsibleList';
import { compareAlphabeticalCaseInsensitive } from '../../lib/utils';
import SynonymList from '../../components/synonymList';

class BasicDiseaseInfo extends Component {
  renderTermList(terms) {
    return terms &&
      <CollapsibleList>
        {terms
          .sort(compareAlphabeticalCaseInsensitive(term => term.name))
          .map(term => (
            <CollapsibleListItem key={term.primaryKey}>
              <Link key={term.primaryKey} to={`/disease/${term.primaryKey}`}>{term.name}</Link>
            </CollapsibleListItem>
          ))}
      </CollapsibleList>;
  }

  renderSourceList(sources) {
    return sources &&
      <CommaSeparatedList>
        {
          sources.map((source) => (
            <ExternalLink href={source.url} key={`source-${source.species.displayName}`}>
              {source.species.displayName}
            </ExternalLink>
          ))
        }
      </CommaSeparatedList>;
  }

  renderDefinition(disease) {
    return (disease.definition || (disease.definitionLinks && disease.definitionLinks.length > 0)) && (
      <div>
        {disease.definition}
        {' '}
        {this.renderDefinitionLinks(disease.definitionLinks)}
      </div>
    );
  }

  renderDefinitionLinks(links) {
    return links &&
      <CommaSeparatedList>
        {
          links.map((link, idx) => (
            <span key={link}>
              <ExternalLink href={link} id={`definition-link-${idx}`}>[{idx + 1}]</ExternalLink>
              <UncontrolledTooltip
                delay={{show: 200, hide: 0}}
                innerClassName={style.urlTooltip}
                placement='bottom'
                target={`definition-link-${idx}`}
              >
                {link}
              </UncontrolledTooltip>
            </span>
          ))
        }
      </CommaSeparatedList>;
  }

  render() {
    const { disease } = this.props;
    return (
      <AttributeList bsClassName='col-12'>
        <AttributeLabel>Definition</AttributeLabel>
        <AttributeValue>
          {this.renderDefinition(disease)}
        </AttributeValue>

        <AttributeLabel>Synonyms</AttributeLabel>
        <AttributeValue placeholder='None'>
          {disease.synonyms && <SynonymList synonyms={disease.synonyms} />}
        </AttributeValue>

        <AttributeLabel>Cross References</AttributeLabel>
        <AttributeValue>
          {disease.crossReferences && <CrossReferenceList crossReferences={disease.crossReferences['ontology_provided_cross_reference']} />}
        </AttributeValue>

        <AttributeLabel>Parent Terms</AttributeLabel>
        <AttributeValue placeholder='None'>{this.renderTermList(disease.parents)}</AttributeValue>

        <AttributeLabel>Child Terms</AttributeLabel>
        <AttributeValue placeholder='None'>{this.renderTermList(disease.children)}</AttributeValue>

        <AttributeLabel>Sources of Associations</AttributeLabel>
        <AttributeValue>{this.renderSourceList(disease.sourceList)}</AttributeValue>
      </AttributeList>
    );
  }
}

BasicDiseaseInfo.propTypes = {
  disease: PropTypes.object,
};

export default BasicDiseaseInfo;
