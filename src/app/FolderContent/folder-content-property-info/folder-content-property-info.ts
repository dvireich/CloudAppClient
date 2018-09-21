import { Component, Input } from "@angular/core";
import { ISelecableProperties } from "../Model/ISelecableProperties";

@Component({
    selector: 'folder-content-propery-info',
    templateUrl: 'folder-content-property-info.html',
    styleUrls: ['folder-content-property-info.css']
})
export class FolderContentPropertyInfo{
    @Input() selectedProperties: ISelecableProperties;
}