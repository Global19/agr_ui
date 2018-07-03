import { createSelector } from 'reselect';

export const selectGeneDomain = (state) => state.gene;

export const selectGene = createSelector(
  [selectGeneDomain],
  (gene) => gene.toJS()
);

export const selectAlleles = createSelector(
  [selectGeneDomain],
  (gene) => gene.get('alleles').toJS()
);

export const selectLoadingAlleles = createSelector(
  [selectGeneDomain],
  (gene) => gene.get('loadingAllele')
);

export const selectTotalAlleles = createSelector(
  [selectGeneDomain],
  (gene) => gene.get('totalAlleles')
);

export const selectPhenotypes = createSelector(
  [selectGeneDomain],
  (gene) => gene.get('phenotypes').toJS()
);
