import router from '@adonisjs/core/services/router'

const SchedulesController = () => import('#controllers/schedules_controller')

router.get('/', () => {
  return { name: 'minuit', status: 'ok' }
})

router
  .group(() => {
    router.get('theater', [SchedulesController, 'index']).as('theater.index')
  })
  .prefix('/api/v1')
  .as('api')
