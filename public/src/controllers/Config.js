import iso3166Codes from '../utils/iso3166Codes.js'
import validateAddress from '../utils/validateAddress.js'
import validateListable from '../utils/validateListable.js'
import fetchConfig from '../utils/fetchConfig.js'

const listableFields = ['countries', 'tokens']
const listableFieldValidates = {
  countries: (value) => {
    return iso3166Codes.indexOf(value) >= 0
  },
  tokens: validateAddress
}

const $configString = document.getElementById('config-string')

export default function ConfigController($scope, $timeout) {

  const hostname = document.location.hostname
  $scope.settingsUrl = hostname.includes('.herokuapp.com')
    ? `https://dashboard.heroku.com/apps/${hostname.split('.')[0]}/settings`
    : 'https://dashboard.heroku.com/apps/'

  fetch('/api/bookzaar/v0/version').then((response) => {
    return response.json()
  }).then((pojo) => {
    $scope.bookzaarVersion = pojo.version
    $scope.$apply()
  })

  fetchConfig().then((configPojo) => {
    $scope.configPojo = configPojo
    listableFields.forEach((field) => {
      $scope.lsvs[field] = configPojo[field].value ? configPojo[field].value.join('\r\n') : ''
      $scope.$apply()
    })
  })

  $scope.$watch('configPojo.makerFee', (makerFee) => {
    $scope.makerFee = parseFloat(makerFee)
  })

  $scope.$watch('configPojo.takerFee', (takerFee) => {
    $scope.takerFee = parseFloat(takerFee)
  })

  $scope.$watch('makerFee', (makerFee) => {
    if (makerFee === undefined || !$scope.configPojo) {
      return
    }
    $scope.configPojo.makerFee = makerFee.toString()
  })

  $scope.$watch('takerFee', (takerFee) => {
    if (takerFee === undefined || !$scope.configPojo) {
      return
    }
    $scope.configPojo.takerFee = takerFee.toString()
  })

  $scope.lsvs = {}

  $scope.generateConfigString = () => {
    $scope.configString = null

    if (!validateAddress($scope.configPojo.feeRecipient)) {
      alert('Invalid Fee Recipient')
      return false
    }

    let isListablesValid

    listableFields.forEach((field) => {
      const pojo = $scope.configPojo[field]
      if (pojo.type === 'all' || pojo.type === 'none') {
        delete pojo.value
      } else {
        pojo.value = $scope.lsvs[field].split(/\r?\n/).map((value) => {
          return value.trim()
        }).filter((value) => {
          return typeof value === 'string' && value.length > 0
        })
      }
    })

    let isValid = true
    _.forEach(listableFields, (field) => {
      isValid = validateListable(field, $scope.configPojo[field], listableFieldValidates[field])
      if (!isValid) {
        return false
      }
    })

    if (isValid) {
      $scope.configString = JSON.stringify($scope.configPojo)
      alert(`Config String Generated`)
      $timeout(() => {
        $configString.style.height = `${$configString.scrollHeight + 10}px`
        window.scrollTo(0, document.body.scrollHeight)
      }, 0)
    }
  }
}
