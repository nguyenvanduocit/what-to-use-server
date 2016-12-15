import LRU from 'lru-cache'
import elasticlunr from 'elasticlunr'

import * as GitHub from './api/github'

// Cache

const detailsCache = LRU({
  max: 500,
  maxAge: 1000 * 60
})

const listCache = LRU({
  maxAge: 1000 * 60 * 5
})

// Search

const index = elasticlunr(function () {
  this.addField('label')
  this.addField('url')
  this.addField('description')
  this.addField('owner')
  this.setRef('url')
})

function indexModule (module, details) {
  index.addDoc({
    url: module.url,
    label: module.label,
    description: details.description,
    owner: details.owner.login
  })
}

async function searchModules (searchText) {
  const { modules } = await getLists()
  const result = index.search(searchText, {
    fields: {
      label: {boost: 2},
      description: {boost: 1},
      url: {boost: 1},
      owner: {boost: 1}
    }
  })
  return result.map(doc => {
    return modules.find(m => m.url === doc.ref)
  })
}

// Data

async function getLists () {
  let lists = listCache.get('lists')
  if (!lists) {
    lists = await GitHub.getModules(module)
    detailsCache.set('lists', lists)
    // Indexing
    for (const module of lists.modules) {
      await getModuleDetails(module)
    }
  }
  return lists
}

async function getModuleDetails (module) {
  let details = detailsCache.get(module.url)
  if (!details) {
    details = await GitHub.getModuleDetails(module)
    detailsCache.set(module.url, details)
    indexModule(module, details)
  }
  return details
}

export default {
  getModules: async () => {
    const { modules } = await getLists()
    return modules
  },
  getCategories: async () => {
    const { categories } = await getLists()
    return categories
  },
  getModuleDetails,
  searchModules
}
