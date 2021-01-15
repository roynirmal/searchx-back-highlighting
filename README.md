# SearchX Backend

SearchX is a scalable collaborative search system being developed by [Lambda Lab](http://www.wis.ewi.tudelft.nl/projects/learning-analytics/) of [TU Delft](https://www.tudelft.nl/).
It is based on [Pineapple Search](http://onlinelibrary.wiley.com/doi/10.1002/pra2.2016.14505301122/full) and is further developed to facilitate search, active reading strategies and sensemaking. SearchX includes features that enable crowdsourced user studies on collaborative search, and is easily extensible for new research.

The backend is responsible for fetching search requests to the search provider and managing the application's data. 
It is built on NodeJS and exposes its endpoints through [express](https://expressjs.com/) (API) and [socket.io](https://socket.io/) (Websockets). Use it together with the [SearchX Highlighting Front End](https://github.com/roynirmal/searchx-front-highlighting) to get a web-based search interface.

## Highlight Backend
This is the backend used for the publication *Note the Highlight: Incorporating Active Reading Tools in a Search as Learning Environment* (CHIIR21) and *How Do Active Reading Strategies AffectLearning Outcomes in Web Search?* (ECIR21). 
It must be used together with with the specific [frontend](https://github.com/roynirmal/searchx-front-highlighting) that was also created for the study, where researchers can enable the Active Reading strategies evaluated: highlight, note-taking or both.
This backend is based on the original [SearchX backend](https://github.com/felipemoraes/searchx-backend), but it has a completely different document rendering process: instead of showing the website with their complex styling, it is stripped down to black text on white background on a single column and images are left untouched - making highlighting easier to achieve and more impactful to the user, as shown below:

#### Simplified Document Viewer
<p align="center">
    <img src="https://github.com/roynirmal/searchx-front-highlighting/blob/master/public/img/viewerTutorial/Slide1.PNG" width="600" >
</p>

#### Regular Document Viewer
<p align="center">
    <img src="https://github.com/roynirmal/searchx-front-highlighting/blob/master/public/img/banana_browser.png" width="600" >
</p>

### SearchX Backend Integration
SearchX is a modular system, so this highlight-specific backend will be integrated back into the original as a feature that can be enabled/disabled, in the first half of 2021.

# Setup
These instructions are for Ubuntu Linux. The steps can be adapted for all major platforms. For Docker see below.

- Install [NodeJS](https://nodejs.org/en/) (at least version 8.0)
    ```
    sudo apt install npm
    
    // Check if node is installed
    which node
    ```
- Install [MongoDB](https://www.mongodb.com/):

    Execute the four steps of the [MongoDB installation instructions](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#install-mongodb-community-edition)
    ```
    // Check if MongoDB is running
    mongo
    // You should see the mongo client connect to the MongoDB server and show its version number.
    // Exit the client using:
    > exit
    ```
- Install [Redis](https://redis.io/)
    ```
    sudo apt install redis-server
    
    // Start Redis
    redis-server
    
    // Check if Redis is running
    redis-cli
    > PING
    // Should return PONG
    > QUIT
    ```
- Set up the server
    ```
    // Clone the repository
    git clone https://github.com/roynirmal/searchx-back-highlighting.git
    
    // Change directory to repository
    cd earchx-back-highlighting
    
    // Install dependencies
    npm install
    
    // Copy example configuration
    cp .env.example .env
    ```
- Choose a search provider
    You can choose between one of the three search providers for which SearchX has included provider modules:
    
    1. [Elasticsearch](#elasticsearch)
    2. [Indri](#indri)
    3. [Bing](#bing)

    The Elasticsearch provider is the easiest to setup with your own dataset, while the Indri provider supports more advanced features such as relevance feedback. The Bing provider is suitable for web search, but requires a (paid) Bing API key. Please see the sections linked for each provider on how to configure and use them. The Bing provider is suitable for web search. If you wish to use another search provider, please see the [custom search providers](#custom-search-providers) section below.
- Run the server
    ```
    // Start the development server
    npm run start
    
    // If you get any errors connecting to MongoDB or Redis they may be running on a different
    // port, instructions for changing the port are in the configuration section below.
    
    // Check if API is running (curl or through browser)
    curl http://localhost:4443/v1
    ```
    
## Docker Setup
Go to the [Docker](https://github.com/felipemoraes/searchx#docker) submodule of the main SearchX repository for detailed instructions. Remember to specify the URL of the backend in the Dockerfile as shown in `highlight/docker-images/app/Dockerfile`. 

## Search Providers
You can install the supported search providers as follows. See the [configuration section](#configuration) for how to configure which search provider is used by default.

### Elasticsearch
Execute the [Elasticsearch installation instructions](https://www.elastic.co/guide/en/elasticsearch/reference/6.2/deb.html).

### Indri
1. Execute the [node-indri installation instructions](https://github.com/felipemoraes/node-indri#setup).
2. Copy the built node-indri module from `build/Release/node-indri` inside your node-indri folder to `lib/node-indri` inside your searchx-backend folder (you need to create the lib and node-indri folders first).

### Bing
SearchX requires a [Bing API key](https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/) to use the Bing web search provider.

Once you have a Bing API key, you can paste it into your `.env` file under the key `BING_ACCESS_KEY`. Be careful not to check the key into version control, since this may lead to abuse if the key leaks.

# API Specification 
```
// Search
[address]/v1/search/[vertical]/?query=[query]&page=[pageNumber]&provider=[provider]
- address: address set in the configuration file (testUrl:PORT)
- vertical: search vertical to use, as specified by search provider, eg. (web, images, videos, news) for bing
- userId: the identifier for the user that is issuing this API call
- sessionId: the identifier for the session that the this API call belongs to
- query: query string
- page: page number
- providerName [optional]: the search provider to use (elasticsearch, indri, bing), defaults to DEFAULT_SEARCH_PROVIDER if unset
- relevanceFeedback [optional, false by default]: whether to use relevance feedback (false, individual, shared)
- distributionOfLabour [optional, false by default]: whether to use distribution of labour (false, unbookmarkedSoft, unbookmarkedOnly)
```

# Configuration
The main production configuration keys can be set in the `.env` file, example values can be found in `.example.env`. These keys are:
- `NODE_ENV`: the node environment (production or development)
- `PORT`: the port server will run on
- `DB`: the database url
- `REDIS`: the redis server url
- `DEFAULT_SEARCH_PROVIDER`: the search provider that is used by default if the provider url parameter of the API is not set
- `BING_ACCESS_KEY` (optional): the API access key for when the Bing search provider is used

Further development configuration can be found inside `app/config/config.js`:
```
module.exports = {
    outDir: './out',
    testDb: 'mongodb://localhost/searchx-test',
    testUrl: 'http://localhost',
    cacheFreshness: 3600,
    scrapFreshness: 60 * 60 * 24
};
```

# Running tests
The tests require that the [Elasticsearch search provider](#elasticsearch) is installed.

```
// Load the test dataset into elasticsearch
./node_modules/elasticdump/bin/elasticdump --input=test/data/test_index_mapping.json --output=http://localhost:9200/cranfield --type=mapping
./node_modules/elasticdump/bin/elasticdump --input=test/data/test_index.json --output=http://localhost:9200/cranfield --type=data

// Run tests
npm test
```

# Modifications
SearchX can be extended to define tasks, and to support new providers for search results.

## Tasks
Tasks define extra functionality that can be used in the frontend for user studies, for example placing users in groups according to predefined criteria, giving them search instructions, and asking them questions on what they found. Two example tasks have been added in `app/services/session/tasks/`. **Highlight-specific tasks will be defined soon.**

### Creating a custom task
To define a new task in the backend, you can add a new service inside `app/services/session/tasks/`  and then change `app/services/session/index.js` to serve the task description from the new service.

## Custom search providers
Three search provider services are included: Elasticsearch, Indri, and Bing. These services can be found in `app/services/search/providers/`, and can serve as example of how to implement new search providers. New search providers can be implemented by adding a service in to the same folder, and adding it to the provider mapping in `app/services/search/provider.js`. The set of possible verticals and number of results per page can be defined as desired by the provider implementation. The provider service must implement the `fetch(query, vertical, pageNumber, resultsPerPage, relevanceFeedbackDocuments)` function, which must return a promise that resolves to an object containing the results if retrieving the search results is successful. The `resultsPerPage` and `relevanceFeedbackDocuments` can be ignored if the provider does not support these functions, see the bing provider for an example of how to handle this case by throwing errors for unsupported values.

The object containing the results needs to have the following fields:
```
{ matches: <number of matches>,
  results: [
    <result>,
    ...
]}
```

The data structure of the `<result>` depends on the result type, which is defined by the component that will be used to display the result in the frontend. See the [searchx-frontend documentation](https://github.com/roynirmal/searchx-front-highlighting#search-providers) for an explanation of how to add custom result types.

The included result types are (fields preceded by `<OPTIONAL>` are optional):

### Web
```
{
  name: <name of the result>,
  url: <full url>,
  displayUrl: <url formatted for display>,
  snippet: <part of text to display on search engine results page>
}
```
### Images
```
{
  name: <name of the image>,
  url: <full url>,
  thumbnailUrl: <url of the thumbnail to display for this image>
}
```

### Videos
```
{
  name: <name of the video>,
  thumbnailUrl: <url of the thumbnail to display for this result>,
  publisher: [
    {name: <name of the first publisher of this video>}
    ...
  ],
  viewCount: <number of times this video has been viewed (integer)>,
  <OPTIONAL> creator: {name: <name of the creator of this video>},
}
```

### News
```
{
  name: <name of the news article>,
  url: <full url>,
  datePublished: <date the article has been published (in format compatible with Date() constructor)>,
  description: <description of the article to display on search engine results page>,
  provider: [
    {name: <name of the first news provider that published this story>}
    ...
  ],
  <OPTIONAL> image: {thumbnail: {contentUrl: <url of the thumbnail to display for this result>}}
}
```

### Text
```
  id: <unique identifier of document>,
  name: <name of the document>,
  date: <date the document was published (in format compatible with Date() constructor)>,
  source: <name of the publisher of this document>,
  snippet: <part of text to display on search engine results page>,
  text: <full document text>
```

# Citation
If you use the highlighting or note-taking widgets of SearchX to produce results for your scientific publication, please refer to our [CHIIR 2021]() or [ECIR2021]() papers.
```
@inproceedings{roy2021active,
  title={How Do Active Reading Strategies Affect Learning Outcomes in Web Search?},
  author={Roy, Nirmal; Valle Torre, Manuel; Gadiraju, Ujwal; Maxwell, David; Hauff, Claudia},
  booktitle={ECIR},
  year={2021}
}

@inproceedings{roy2021notehighlight,
  title={ Note the Highlight: Incorporating Active Reading Tools for Search As Learning},
  author={Roy, Nirmal; Valle Torre, Manuel; Gadiraju, Ujwal; Maxwell, David; Hauff, Claudia},
  booktitle={CHIIR},
  year={2021}
}
```

# License
[MIT](https://opensource.org/licenses/MIT) License
