import { ImgDetailInfo } from "../models/img-detail-info.model";
import { SimilarInfo } from "../models/similar-info.model";
import { SparqlResult } from "../models/SparqlResult";

export const DUMMY_SPARQL_RESULT: SparqlResult = {
  head: {
    vars: ["Source", "Target", "Distance"]
  },
  results: {
    bindings: [
      {
        Source: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Interieur_westwand_donjon_-_Wijk_bij_Duurstede_-_20213139_-_RCE.jpg" },
        Target: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Sheep2_small.jpg" },
        Distance: { type: "literal", value: "1128.49" }
      },
      {
        Source: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Plattegrond_van_Blaeu,_reproductie_uit_album_Rijksdienst_voor_de_Monumenten_Zorg_te_Zeist_-_'s-Gravenzande_-_20091714_-_RCE.jpg" },
        Target: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Turpin_de_crissé_(1782-1859).jpg" },
        Distance: { type: "literal", value: "682.369" }
      },
      {
        Source: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Fotothek_df_roe-neg_0000085_002_Portrait_eines_Klarinettisten_(Baldo_Maestri^).jpg" },
        Target: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Voit_208_Julius_Binder.jpg" },
        Distance: { type: "literal", value: "1723.89" }
      },
      {
        Source: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/HaHaskalaa011.jpg" },
        Target: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Die_Gartenlaube_(1888)_140.jpg" },
        Distance: { type: "literal", value: "1278.46" }
      },
      {
        Source: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Eduard_Jantos_(Martin_Rulsch)_3.jpg" },
        Target: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Biserka-Radisic.jpg" },
        Distance: { type: "literal", value: "1502.98" }
      },
      {
        Source: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Bercy_sous_la_neige.JPG" },
        Target: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/St._Annen,_Annaberg._Glocke_1,_Inschrift_Rückseite.jpg" },
        Distance: { type: "literal", value: "1591.37" }
      },
      {
        Source: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Manchester_Exchange_railway_station_in_1989.jpg" },
        Target: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/COLLECTIE_TROPENMUSEUM_Theeplantage_Balimbingan_TMnr_60017451.jpg" },
        Distance: { type: "literal", value: "975.868" }
      },
      {
        Source: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/NEU3.jpg" },
        Target: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Dřenice_Autoprodejna_KIA.JPG" },
        Distance: { type: "literal", value: "1291.29" }
      },
      {
        Source: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Forestry,_Glen_Doll_-_geograph.org.uk_-_1780312.jpg" },
        Target: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Statens_bakteriologiska_laboratorium_July_2011a.jpg" },
        Distance: { type: "literal", value: "1705.08" }
      },
      {
        Source: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Eterusia_aedea_formosana1.jpg" },
        Target: { type: "uri", value: "http://imgpedia.dcc.uchile.cl/resource/Mexican_Revolution_(316).jpg" },
        Distance: { type: "literal", value: "1237.24" }
      }
    ]
  }
};


export const DUMMY_IMG_DETAIL: ImgDetailInfo = {
    fileName: 'dummy_image.jpg',
    originalUrl: 'http://dummy.url/dummy_image.jpg',
    thumbUrl: 'http://dummy.url/dummy_image_thumb.jpg',
    associatedWith: new Set([
      'http://imgpedia.dcc.uchile.cl/resource/Interieur_westwand_donjon_-_Wijk_bij_Duurstede_-_20213139_-_RCE.jpg',
      'http://imgpedia.dcc.uchile.cl/resource/Sheep2_small.jpg'
    ]),
    appearsIn: new Set(['album_1', 'album_2']),
    height: 1080
  };
  
  export const DUMMY_SIMILARS_NAMES: string[] = [
    'http://imgpedia.dcc.uchile.cl/resource/COLLECTIE_TROPENMUSEUM_Theeplantage_Balimbingan_TMnr_60017451.jpg',
    'http://imgpedia.dcc.uchile.cl/resource/Turpin_de_crissé_(1782-1859).jpg',
    'http://imgpedia.dcc.uchile.cl/resource/Fotothek_df_roe-neg_0000085_002_Portrait_eines_Klarinettisten_(Baldo_Maestri^).jpg'
  ];
  
  export const DUMMY_DESCRIPTORS: { [id: string]: SimilarInfo[] } = {
    'Descriptor 1': [
      new SimilarInfo('http://imgpedia.dcc.uchile.cl/resource/Voit_208_Julius_Binder.jpg', 1.0),
      new SimilarInfo('http://imgpedia.dcc.uchile.cl/resource/HaHaskalaa011.jpg', 2.0)
    ],
    'Descriptor 2': [
      new SimilarInfo('http://imgpedia.dcc.uchile.cl/resource/Die_Gartenlaube_(1888)_140.jpg', 3.0),
      new SimilarInfo('http://imgpedia.dcc.uchile.cl/resource/Eduard_Jantos_(Martin_Rulsch)_3.jpg', 4.0)
    ],
    'Descriptor 3': [
      new SimilarInfo('http://imgpedia.dcc.uchile.cl/resource/Biserka-Radisic.jpg', 5.0),
      new SimilarInfo('http://imgpedia.dcc.uchile.cl/resource/Bercy_sous_la_neige.JPG', 6.0)
    ]
  };