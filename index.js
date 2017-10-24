/**
 * Created by evgenygolubev on 17.08.17.
 */

export const HOTELS_FILTER_ADDITIONAL_COMPONENT_NAME = 'hotelsFilterAdditionalComponent';

export const hotelsFilterAdditionalComponent = {
  bindings: {
    masterHotels: '<',
    selectedView: '<',
    onUpdateHotels: '&'
  },
  controller: require('./ctrl.js').HotelsFilterAdditionalComponentController,
  template: require('./tpl.html')
};
