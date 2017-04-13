import { NgModule, Component, OnInit, ElementRef, Input, Output, EventEmitter, SimpleChanges, HostListener, forwardRef, Renderer } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';

class Option {
  label: string;
  value: string;
}

@Component({
  selector: 'sm-multiselect',
  templateUrl: "./multiselect.html",
  styleUrls: ["./multiselect.css"],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiSelect), multi: true }
  ]
})
export class MultiSelect implements OnInit, ControlValueAccessor {
  @HostListener('document:click', ['$event.target'])
  public onDocumentClick(targetElement) {
    if (this.elemRef.nativeElement.contains(targetElement)) {
      if (!this.panelVisible) this.show();
    } else {
      this.hide();
    }
  }

  @Input()
  options: Option[];

  @Input()
  valueKey: string = "value";

  @Input()
  optionLabelKey: string = "label";

  @Input()
  optionShortLabelKey: string = "label";

  @Input()
  labelPrefix: string;

  @Input()
  defaultLabel: string;

  private innerValue: string[];

  private changed = new Array<(value: string[]) => void>();
  private touched = new Array<() => void>();

  valuesAsString: string = "";

  filterValue: string;

  visibleOptions: Option[];

  panelVisible: boolean = false;

  documentClickListener: any;

  constructor(private elemRef: ElementRef, public renderer: Renderer) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('options') && changes['options'].currentValue.length > 0) {
      this.updateLabel();
    }
  }

  writeValue(value: string[]) {
    this.innerValue = value;
    this.updateLabel();
  }

  registerOnChange(fn: (value: string[]) => void) {
    this.changed.push(fn);
  }

  registerOnTouched(fn: () => void) {
    this.touched.push(fn);
  }

  onCloseClick($event): void {
    this.hide();
    $event.stopPropagation();
  }

  onFilter(event): void {
    this.filterValue = event.target.value.trim().toLowerCase();
    this.visibleOptions = this.options.filter((o: Option) => {
      return o[this.optionLabelKey].trim().toLowerCase().indexOf(this.filterValue) != -1;
    });
  }

  isOptionVisible(option: Option): boolean {
    if (this.filterValue) {
      return this.visibleOptions.find((o: Option) => o[this.valueKey] == option[this.valueKey]) != undefined;
    }
    return true;
  }

  onOptionClick($event, option: Option): void {
    console.log("clicked");
    let index: number = this.getSelectedOptionIndex(option);
    if (index == -1) {
      this.innerValue.push(option[this.valueKey]);
    } else {
      this.innerValue.splice(index, 1);
    }
    this.updateLabel();
  }

  isOptionSelected(option: Option): boolean {
    return this.getSelectedOptionIndex(option) != -1;
  }

  private getSelectedOptionIndex(option: Option): number {
    let index = -1;
    if (this.innerValue && this.innerValue.length > 0) {
      index = this.innerValue.indexOf(option[this.valueKey]);
    }
    return index;
  }

  onLabelClick($event): void {
    $event.stopPropagation();
  }

  private updateLabel() {
    if ((this.options && this.options.length > 0) && (this.innerValue && this.innerValue.length > 0)) {
      let labelKey = this.optionShortLabelKey ? this.optionShortLabelKey : this.optionLabelKey;
      let values: string[] = this.innerValue.map((v: string) => {
        let option: Option = this.findOptionByValue(v);
        if (option) {
          return option[labelKey];
        }
      });
      this.valuesAsString = values.join(', ');
    } else {
      this.valuesAsString = this.defaultLabel;
    }
  }

  private findOptionByValue(value: string): Option {
    return this.options.find((o: Option) => o[this.valueKey] == value);
  }

  private hide(): void {
    this.panelVisible = false;
  }

  private show(): void {
    this.panelVisible = true;
  }
}

@NgModule({
  imports: [CommonModule],
  exports: [MultiSelect],
  declarations: [MultiSelect]
})
export class MultiSelectModule { }
