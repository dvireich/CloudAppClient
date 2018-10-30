import { Component, Input } from "@angular/core";
import { IContexMentuItem } from "../contex-menu.component/icontex-mentu-item";
import { IMultiLevelContexMenuItem } from "./imulti-level-contex-menu-item";
import { MultiLevelContexMenuItem } from "./multi-level-contex-menu-item";

@Component({
    selector: 'multi-level-contex-menu',
    templateUrl: './multi-level-contex-menu.component.html',
    styleUrls: ['./multi-level-contex-menu.component.html']
})
export class MultiLevelContexMenu{

    @Input() x: number =0;
    @Input() y: number =0;
    
    private _contexMentuItems: IContexMentuItem[];
    public get contexMentuItems(): IContexMentuItem[] {
        return this._contexMentuItems;
    }
    @Input()
    public set contexMentuItems(value: IContexMentuItem[]) {
        this._contexMentuItems = value;
        this.createAllLevels();
        this.updateOpenSubsFunctionForAllSubs();
        this.showFirstLevel();
    }
    
    allLevels: IMultiLevelContexMenuItem[][] = [];

    createAllLevels(){
        this.allLevels = [];
        let baseLevel = [this.convertToMultiLevelContexMenuItem(this.contexMentuItems)];
        this.allLevels.push(baseLevel);

        for(let i = 0; i < this.allLevels.length; i++){           
            let currLevel = this.allLevels[i];

            let subLevels: IMultiLevelContexMenuItem[] = [];
            for(let j = 0; j < currLevel.length; j++){
                let multiLevelContexMenuItem = currLevel[j];
                for(let n = 0; n < multiLevelContexMenuItem.contaxMenuItem.length; n++){
                    let currContaxMenuItem = multiLevelContexMenuItem.contaxMenuItem[n];
                    if(currContaxMenuItem.subs === null || currContaxMenuItem.subs === undefined) continue;
                    subLevels.push(this.convertToMultiLevelContexMenuItem(currContaxMenuItem.subs));
                }
            }
            if(subLevels.length == 0) continue;
            this.allLevels.push(subLevels);
        }
    }

    convertToMultiLevelContexMenuItem(contexMentuItem: IContexMentuItem[]) : IMultiLevelContexMenuItem{
        let multiLevelContexMenuItem = new MultiLevelContexMenuItem();
        multiLevelContexMenuItem.contaxMenuItem = contexMentuItem;
        multiLevelContexMenuItem.show = false;

        return multiLevelContexMenuItem;
    }

    closeAllLevelSubs(level: number){
        if(level >= this.allLevels.length) return;
        let subs = this.allLevels[level]; 
        subs.forEach(sub => sub.show = false);
    }

    openSubs(level: number, subs: IContexMentuItem[]){
        this.closeAllLevelSubs(level);
        let allLevelSubs = this.allLevels[level];
        let selectedSubs =  allLevelSubs.filter(s => s.contaxMenuItem === subs);
        if(selectedSubs === null || selectedSubs === undefined || selectedSubs.length === 0){
            let errorMessage = `Cant find subs in level: ${level} subs: ${JSON.stringify(subs)} allSubs: ${JSON.stringify(this.allLevels)}`; 
            throw new Error(errorMessage);
        }

        selectedSubs[0].show = true;
    }

    updateOpenSubsFunctionForAllSubs(){
        for(let level = 0; level < this.allLevels.length; level++){
            let allLevelSubs = this.allLevels[level];
            allLevelSubs.forEach(multiLevelContexMenuItem => {
                multiLevelContexMenuItem.contaxMenuItem.forEach(item =>
                {
                    //Add function for open the subs
                    const openSubsOnLevel = ()=>{
                        if(item.subs === null || item.subs === undefined){
                         this.closeAllLevelSubs(level + 1);
                         return;
                        };
                        this.openSubs(level + 1, item.subs)
                    };

                    item.onOverIn = openSubsOnLevel;

                    //Replace the item.onClick if the item has subs since he wont need it
                    if(item.subs === null || item.subs === undefined) return;
                    item.onClick = openSubsOnLevel;
                })
            })
        }
    }

    showFirstLevel(){
        if(this.allLevels.length === 0) return;
        this.allLevels[0][0].show = true;
    }
}