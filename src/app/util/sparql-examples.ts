import { query } from "@angular/animations";

const sparqlExamples = [
  {
    key: "federatedClustering",
    button: "Federated Clustering",
    description: "Grouping countries by life expectancy and HDI using the new operator CLUSTER BY.",
    query: `PREFIX sim: <http://sj.dcc.uchile.cl/sim#>
PREFIX imo: <http://imgpedia.dcc.uchile.cl/ontology#>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

# Group countries by life expectancy and HDI

SELECT DISTINCT ?country (?countryLabelES AS ?countryname) ?lifeExpectancy ?hdi ?isoCode ?c WHERE {
  SERVICE <https://query.wikidata.org/sparql> { 
    ?country wdt:P31 wd:Q6256 ;           
            wdt:P2250 ?lifeExpectancy ;  
            wdt:P297 ?isoCode ;          
            wdt:P1081 ?hdi .  # IDH 
    OPTIONAL { ?country rdfs:label ?countryLabelES FILTER (lang(?countryLabelES) = "es") }

    BIND(?hdi * 10 AS ?scaledHDI)
  }
}
CLUSTER BY ?lifeExpectancy ?hdi WITH sim:kmeans(4) AS ?c
`
  },

  {
    key: "imgpediaClustering",
    button: "Imgpedia Resource Clustering",
    description: "Clustering Imgpedia resources based on their vector descriptors.",
    query: `PREFIX sim: <http://sj.dcc.uchile.cl/sim#>
PREFIX imo: <http://imgpedia.dcc.uchile.cl/ontology#>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>

#Using CLUSTER BY to group dog related images based on their HOG vector descriptors

SELECT ?img ?c WHERE {
  SERVICE <https://query.wikidata.org/sparql>{
    ?dog wdt:P31 wd:Q144 . # Dogs
  }
  ?img imo:associatedWith ?dog .
  ?vector a imo:HOG ;
  imo:describes ?img ;
  imo:value ?hog .
}
CLUSTER BY ?hog WITH sim:kmeans(3) AS ?c
    `
  },

  {
    key:"basicQuery",
    button: "Simple Query To Retrieve Images",
    description: "A basic query to retrieve images and their distances from a given image.",
    query: `PREFIX imo: <http://imgpedia.dcc.uchile.cl/ontology#>

SELECT ?Source ?Target ?Distance WHERE{ ?Rel imo:sourceImage ?Source;
  imo:targetImage ?Target;
  imo:distance ?Distance .
} LIMIT 10`
  }
];
export default sparqlExamples;