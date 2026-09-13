import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Theater from '#models/theater'

const THEATERS = [
  { allocineId: 'P0963', name: 'UGC Ciné Cité', slug: 'ugc-cine-cite' },
  { allocineId: 'P0026', name: 'Le Cosmos', slug: 'le-cosmos' },
  { allocineId: 'P0600', name: 'Vox', slug: 'vox' },
  { allocineId: 'P0027', name: 'Star', slug: 'star' },
  { allocineId: 'P0025', name: 'Star St-Exupéry', slug: 'star-st-exupery' },
  { allocineId: 'P0751', name: 'Pathé Brumath', slug: 'pathe-brumath' },
]

export default class extends BaseSeeder {
  static environment = ['development', 'production', 'test']

  async run() {
    for (const t of THEATERS) {
      await Theater.firstOrCreate(
        { allocineId: t.allocineId },
        { name: t.name, slug: t.slug, isActive: true }
      )
    }
  }
}
