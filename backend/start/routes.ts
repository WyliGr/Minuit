import router from '@adonisjs/core/services/router'

const SchedulesController = () => import('#controllers/schedules_controller')
const TheatersController = () => import('#controllers/theaters_controller')
const PostersController = () => import('#controllers/posters_controller')

router.get('/', () => {
  return { name: 'minuit', status: 'ok' }
})

router
  .group(() => {
    router.get('theater', [SchedulesController, 'index']).as('theater.index')
    router.get('theaters', [TheatersController, 'index']).as('theaters.index')
    router.get('poster', [PostersController, 'show']).as('poster.show')
  })
  .prefix('/api/v1')
  .as('api')
