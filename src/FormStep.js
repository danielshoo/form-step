import { bemModShown, bemModHidden } from 'bem-mod';

/**
 * @description FormStep is a module for grouping elements of a form and managing whether that group is displayed or not
 * based on the validity of any FormSteps it is subscribed to. This effects the visibility of the root element and any
 * known input elements. Any other logic to show/hide other elements show be handled in callback logic.
 */
export default class FormStep {

    #isValidClientCodeFlag;

    #doShowCallback = () => {};
    #doHideCallback = () => {};
    #isValidSubscribers = [];

    /**
     * @param elmSection - A root node for which this Form Step is managing.
     * @param {NodeList|[]} elmInputs - An array of elements or NodeList that will normalized to be an array.
     */
    constructor(elmSection, elmInputs) {
        this.elmSection = elmSection;
        this.elmInputs = Array.from(elmInputs);
    }

    set doShowCallback(callback) {
        this.#doShowCallback = callback;
    }

    set doHideCallback(callback) {
        this.#doHideCallback = callback;
    }

    /**
     * @description sets a flag that has ultimate say over whether this form step is valid or not. This is useful for
     * when client code needs to have control over the validity of a form step.
     *
     * @param {boolean|undefined} isValid - Setting to undefined is equivalent to deleting the override.
     */
    set isValidClientCodeFlag(isValid) {
        this.#isValidClientCodeFlag = isValid;
    }

    #doShow() {
        bemModShown(this.elmSection);
        bemModShown(this.elmInputs);
        this.#doShowCallback?.();
    }

    #doHide() {
        bemModHidden(this.elmSection);
        bemModHidden(this.elmInputs);
        this.#doHideCallback?.();
    }

    #isSectionValid() {

        for (let i = 0; i < this.elmInputs.length; i++) {

            if (!this.elmInputs[i]._fnFormStepValidityCheck) {
                continue; // Assume that the input is valid if it doesn't have an isValid method.
            }

            if (!this.elmInputs[i]._fnFormStepValidityCheck()) {
                return false;
            }
        }

        return (typeof this.#isValidClientCodeFlag === 'boolean') ? this.#isValidClientCodeFlag : true;
    }

    appendToForm(elmForm) {
        elmForm.appendChild(this.elmSection);
    }

    subscribe(formStep) {
        if (!formStep instanceof FormStep) {
            throw new Error('FormStep#addIsValidSubscriber expects a FormStep instance as a parameter.');
        }

        this.#isValidSubscribers.push(formStep);
    }

    /**
     * @description This method starts notifying the chain of subscribers skipping this FormStep itself
     * triggering its doShow/doHide methods.
     *
     * @param {boolean} isNotifyingFormStepValid - A flag to ensure that any invalid formStep in the subscriber chain
     * defaults the next FormStep to also be invalid.
     */
    notifySubscribers(isNotifyingFormStepValid = true) {
        this.#isValidSubscribers.forEach(subscriber => {
            subscriber.notify(isNotifyingFormStepValid && this.#isSectionValid());
        });
    }

    /**
     * @description This method starts notifying the chain of subscribers starting with this FormStep itself
     * triggering its doShow/doHide methods.
     *
     * @param {boolean} isNotifyingFormStepValid - Defaulted to true for the case that earlier FormSteps in the
     *   subscriber chain can be ignored
     */
    notify(isNotifyingFormStepValid = true) {

        if (isNotifyingFormStepValid) {
            this.#doShow();
        } else {
            this.#doHide();
        }

        this.notifySubscribers(isNotifyingFormStepValid);
    }
}