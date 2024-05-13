# form-step
A module for grouping elements of a form and managing whether that group is displayed or not based on other observed FormSteps

This module assumes the use of BEM notation on class names and used npm package bem-mod to toggle --hidden modifiers on elements.
It's up to you and the css you author to determine what it means for a form step to be hidden. For example, is 
the hidden form step 'display: none;', 'height: 0;', 'visibility: hidden;', etc. Each have their own use cases and support 
and imacts on accessibility, supported css transitions, etc. 

## Installation
```bash
npm i form-step;
```

## Usage
```js
import FormStep from 'form-step';
```

## Instructions
1. Create a new FormStep instance
```js
const elmSection = document.querySelector('.contract');
const elmExpDateInput = elmSection.querySelector('.contract__date-input');
const elmSignatureInput = elmSection.querySelector('.contract__signature-input');

const contractDetailsFormStep = new FormStep(elmSection);
```
2. Add elements to the FormStep instance
```js
formStep.add(elmExpDateInput);
formStep.add(elmSignatureInput);
```
3. Set Validations on the elements that collectively determine if the FormStep is valid or not:
```js
// For example, if the expiration date is in the future, this "contract exp date" is valid
formStep.addValidationMethodToElement(elmExpDateInput, () => {
    return new Date(elmExpDateInput.value) > new Date(new Date().setDate(new Date().getDate() + 1));
});
// For example, if the signature input is not empty, this "contract signature" is valid
formStep.addValidationMethodToElement(elmSignatureInput, () => {
    return elmSignatureInput.value.trim() !== '';
});
```
4. Add 1 or more FormSteps to observe:
```js
const completionMessageFormStep = new FormStep(document.querySelector('.contract__completion-message'));
formStep.observe(contractDetailsFormStep);
```

5. Through event handlers, programmatically, or other means, call notify()/notify-subscribers() on the FormStep to be observed.
This will cause a re-evaluation of each FormStep's validity and update the BEM modifiers on each subscribed form step. For chains of more
than 2 FormSteps, if any FormStep is invalid, and form step further down the chain will also be considered invalid.
```js
contractDetailsFormStep.notifySubscribers(); 
```