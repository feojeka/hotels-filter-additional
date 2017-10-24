/**
 * Created by evgenygolubev on 17.08.17.
 */
import angular from 'angular';

export class HotelsFilterAdditionalComponentController {
  constructor(
    $scope,
    $timeout,
    $translate,
    AppConfiguration,
    ModalService
  ) {

    this._AppConfiguration = AppConfiguration;
    this._ModalService = ModalService;
    this._$scope = $scope;
    this._$timeout = $timeout;
    this._$translate = $translate;
    this.$onChanges = this._onChanges;
    this.fixFilterMark = true;

    this.sorts = [
      {
        label: this._$translate.instant('hotelsFilterMainComponent.recommended'),
        value: 'recommended'
      },
      {
        label: this._$translate.instant('hotelsFilterMainComponent.price'),
        value: 'price'
      },
      {
        label: this._$translate.instant('hotelsFilterMainComponent.cashback'),
        value: 'cashback'
      },
      {
        label: this._$translate.instant('hotelsFilterMainComponent.star'),
        value: 'star'
      }
    ];
    // Additional filter
    this.additionalFilter = {
      hotelName: '',
      minPrice: 0,
      maxPrice: 0,
      stars: this.constructor._createStars(),
      sort: this.sorts[0].value
    };

    this.listViewSort = this.sorts[0].value;

    this.slider = angular.copy(this._AppConfiguration.priceSliderDefaultParams);
  }

  _onChanges(changes) {

    const selectedView = changes.selectedView;
    if (selectedView && !selectedView.isFirstChange()) {
      if (selectedView.currentValue === 'map' && selectedView.previousValue !== 'map') {
        this.listViewSort = this.additionalFilter.sort;
      }
      if (selectedView.currentValue === 'list' && selectedView.previousValue !== 'list') {
        this.additionalFilter.sort = this.listViewSort;
        this._sortLocal();
      }
    }

    const masterHotels = changes.masterHotels;
    if (masterHotels && !masterHotels.isFirstChange()) {
      this.masterHotels = changes.masterHotels.currentValue;
      this._prepareSlider();
      this.filterLocal();
    }
  }

  filterLocal() {
    this.hotels = this.masterHotels.slice();

    if (this.hotels.length) {
      this._filterLocalByHotelName();
      this._filterLocalByHotelPrice();
      this._filterLocalByStars();
      this._sortLocal();
    }

    this.onUpdateHotels({
      $event: {
        hotels: this.hotels
      }
    });
  }

  _prepareSlider() {

    // Default slider params
    let slider = angular.copy(this._AppConfiguration.priceSliderDefaultParams);

    let prices = [].concat(...this.masterHotels.map(hotel => {
        return hotel.packages.map(pack => pack.displayPricePerNight.amount);
      })
    );

    if (prices.length > 1) {
      slider.options.floor = Math.min(...prices);
      slider.options.ceil = Math.max(...prices);
      slider.options.step = Math.round((slider.options.ceil - slider.options.floor) / 100);
      slider.options.onEnd = () => {
        this.additionalFilter.minPrice = this.slider.minVal;
        this.additionalFilter.maxPrice = this.slider.maxVal;
        this.filterLocal();
      };
      slider.options.disabled = false;
      slider.minVal = Math.round(slider.options.floor);
      slider.maxVal = Math.round(slider.options.ceil);
    }

    if (prices.length === 1) {
      slider.options.ceil = Math.round(prices[0] * 2);
      slider.options.step = 1;
      slider.options.readOnly = true;
      slider.options.disabled = false;
      slider.minVal = Math.round(prices[0]);
      slider.maxVal = Math.round(prices[0]);
    }

    this.slider = slider;
    this.additionalFilter.minPrice = this.slider.minVal;
    this.additionalFilter.maxPrice = this.slider.maxVal;

    this._refreshSlider();
  }

  _refreshSlider() {

    this._$timeout(() => {
      this._$scope.$broadcast('rzSliderForceRender');
    });
  }

  _filterLocalByHotelName() {

    let input = this.additionalFilter.hotelName;
    let regex;

    if (input.length > 0) {
      regex = new RegExp(input, 'gi');
      this.hotels = this.hotels.filter(hotel => regex.test(hotel.name));
    } else {
      this.hotels = this.masterHotels.slice();
    }
  }

  _filterLocalByHotelPrice() {

    this.hotels = this.hotels.filter(hotel => {
      return hotel.packages.find(pack => {
        return (pack.displayPricePerNight.amount >= this.additionalFilter.minPrice &&
                pack.displayPricePerNight.amount <= this.additionalFilter.maxPrice);
      });
    });
  }

  _filterLocalByStars() {

    let starsArray = this.additionalFilter.stars
      .filter(star => star.active === true)
      .map(star => star.value);

    this.hotels = this.hotels.filter(hotel => (starsArray.indexOf(Math.floor(hotel.rating.stars)) !== -1));
  }

  _sortLocal() {

    switch (this.additionalFilter.sort) {
      case 'recommended': {
        break;
      }
      case 'price': {
        this.hotels = this.hotels.sort((a, b) => {
          return Math.min(...a.packages.map(pack => pack.displayPricePerNight.amount)) -
                 Math.min(...b.packages.map(pack => pack.displayPricePerNight.amount));
        });
        break;
      }
      case 'cashback': {
        this.hotels = this.hotels.sort((a, b) => {
          return Math.min(...b.packages.map(pack => pack.cashback.percentage)) -
                 Math.min(...a.packages.map(pack => pack.cashback.percentage));
        });
        break;
      }
      case 'star': {
        this.hotels = this.hotels.sort((a, b) => {
          return Math.min(b.rating.stars) -
                 Math.min(a.rating.stars);
        });
        break;
      }
    }
  }

  toggleStar(star) {

    if (this.additionalFilter.stars.find(s => (s.active === true && s.value !== star.value))) {
      star.active = !star.active;
      this.filterLocal();
    }
  }

  openMobileAdditionalFilter() {
    this._ModalService.mobileAdditionalFilter(this);
  }

  static _createStars() {

    let stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push({value: i, active: true});
    }

    return stars;
  }

}

HotelsFilterAdditionalComponentController.$inject = [
  '$scope',
  '$timeout',
  '$translate',
  'AppConfiguration',
  'ModalService'
];
