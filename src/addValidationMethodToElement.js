export default function addValidationMethodToElement(elm, fnCheckValidity) {
    elm._fnFormStepValidityCheck = fnCheckValidity;
}