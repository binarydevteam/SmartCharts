import { observable, action, computed, when } from 'mobx';

export default class AssetInformationStore {
    constructor(mainStore) {
        this.mainStore = mainStore;
        when(() => this.context, this.onContextReady);
    }
    @computed get decimalPlaces() {
        return this.mainStore.chart.currentActiveSymbol.decimal_places;
    }
    @computed get isTick() {
        return this.mainStore.timeperiod.timeUnit === 'tick';
    }

    get context() { return this.mainStore.chart.context; }
    get stx() { return this.context.stx; }

    onContextReady = () => {
        this.visible = this.stx.layout.assetInformation || true;
        this.stx.prepend('headsUpHR', this.update);
        this.stx.prepend('createXAxis', this.update);
    };

    @action.bound update() {
        const stx = this.context.stx;
        const bar = stx.barFromPixel(stx.cx);
        const prices = stx.chart.xaxis[bar];

        if(!prices) { return; }

        const {Open, High, Low, Close} = prices.data || { };
        this.open = (Open && !this.isTick) ? Open.toFixed(this.decimalPlaces) : null;
        this.high = (High && !this.isTick) ? High.toFixed(this.decimalPlaces) : null;
        this.low = (Low && !this.isTick) ? Low.toFixed(this.decimalPlaces) : null;
        this.close = (High && !this.isTick) ? Close.toFixed(this.decimalPlaces) : null;
        this.price = Close ? Close.toFixed(this.decimalPlaces) : null;
    }

    @action.bound setVisible(value) {
        this.visible = value;
        this.stx.layout.assetInformation = value;
        this.mainStore.chart.saveLayout();
    }

    @observable visible = true;
    @observable price = null;
    @observable open = null;
    @observable high = null;
    @observable low = null;
    @observable close = null;
}
