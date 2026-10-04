'use strict'
exports.submitOnce = async (client, key, payload) => {
  try { return { status: 'confirmed', id: (await client.create(key, payload)).id } }
  catch (err) {
    if (err.code !== 'TIMEOUT') throw err
    const found = await client.lookup(key)
    if (found.status === 'found') return { status: 'confirmed', id: found.id }
    return { status: 'confirmed', id: (await client.create(key, payload)).id }
  }
}
