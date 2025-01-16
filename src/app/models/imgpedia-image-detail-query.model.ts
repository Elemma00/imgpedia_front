import {ImgpediaRegistry} from './imgpedia-image-binding-query.model';

export interface Binding {
  dbp: ImgpediaRegistry;
  wiki: ImgpediaRegistry;
}

export interface Results {
  bindings: Binding[];
}

export interface ImgpediaDetailQueryResult {
  results: Results;
}
