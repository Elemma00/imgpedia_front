import { query } from "@angular/animations";

const sparqlExamples = [
  {
    key:"basicQuery",
    button: "Simple Query To Retrieve Images",
    description: "A basic query to retrieve images and their distances from a given image.",
    query: `PREFIX imo: <http://imgpedia.dcc.uchile.cl/ontology#>

SELECT ?Source ?Target ?Distance WHERE{ ?Rel imo:sourceImage ?Source;
  imo:targetImage ?Target;
  imo:distance ?Distance .
} LIMIT 10`
  },

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
    key: "simiJoinFede",
    button: "Similarity Join Query ",
    description: "A query that performs a similarity join between Imgpedia and Wikidata resources using the new operator SIMILARITY JOIN.",
    query: `PREFIX sim: <http://sj.dcc.uchile.cl/sim#>
PREFIX imo: <http://imgpedia.dcc.uchile.cl/ontology#>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>

# This query retrieves IMGpedia images associated with the Entel Tower (wd:Q1421270)
# and extracts their HOG descriptors.
# Then, it finds the 10 most similar IMGpedia images that are associated with any tower
# (as defined in Wikidata), using the Manhattan distance between HOG descriptors
# via the SIMILARITY JOIN operator.

SELECT ?img2 ?tower ?dist WHERE {
{ ?img1 imo:associatedWith wd:Q1421270 . # Entel Tower
  ?vector1 a imo:HOG ; # HOG descriptor
  imo:describes ?img1 ;
  imo:value ?hog1 .}
SIMILARITY JOIN ON (?hog1) (?hog2) TOP 10 DISTANCE sim:manhattanvec AS ?dist # 10nn w/ Manhattan
{
  SERVICE <https://query.wikidata.org/sparql> {
  ?tower wdt:P31/wdt:P279* wd:Q12518 . # Towers
}
  ?img2 imo:associatedWith ?tower .
  ?vector2 a imo:HOG ;
  imo:describes ?img2 ;
  imo:value ?hog2 .
}}

`
  }
];
export default sparqlExamples;