/// <reference path="FB3DOMHead.ts" />

module FB3DOM {

	export class FB3Text implements IFB3Block {
		public Chars: number;
		constructor(private text: string, public Parent: IFB3Block, public ID: number) {
			this.Chars = text.length;
		}
		public GetHTML(HyphOn: bool, Range: IRange): string {
			return this.text;  // todo - HyphOn must work, must just replace shy with ''
		}

		public GetXPID(): string {
			var ID: string = "";
			if (this.Parent) {
				ID = this.Parent.GetXPID() + '_';
			}
			return ID + this.ID;
		}
	}


	export class FB3Tag extends FB3Text implements IFB3Block {
		public Chars: number;
		private TagName: string;
		private Childs: IFB3Block[];

		public GetHTML(HyphOn: bool, Range: IRange): string {
			var Out = [this.GetInitTag(Range)];
			var CloseTag = this.GetCloseTag(Range);
			var From = Range.From.shift() || 0;
			var To = Range.To.shift();
			if (To === undefined)
				To = this.Childs.length - 1;
			if (To >= this.Childs.length) {
				console.log('Invalid "To" on "GetHTML" call, element "' + this.GetXPID + '"');
				To = this.Childs.length - 1;
			}
			if (From < 0 || From >= this.Childs.length) {
				console.log('Invalid "From" on "GetHTML" call, element "' + this.GetXPID + '"');
				From = 0;
			}
			for (var I = From; I <= To; I++) {
				Out.push(this.Childs[I].GetHTML(HyphOn, Range));
			}
			Out.push(CloseTag);
			return Out.join(''); // Hope one join is faster than several concats
		}

		constructor(public Data: IJSONBlock, Parent: IFB3Block, ID: number) {
			super('', Parent, ID);
			this.TagName = Data.t;
			this.Childs = new Array();
			for (var I = 0; I <= Data.c.length; I++) {
				var Itm = Data.c[I];
				var Kid: IFB3Block;
				if (typeof Itm === "string") {
					Kid = new FB3Tag(Itm, this, I);
				} else {
					Kid = new FB3Text(Itm, this, I);
				}
				this.Childs.push(Kid);
				this.Chars += Kid.Chars;
			}
		}

		public GetCloseTag(Range: IRange): string {
			return '</' + this.TagName + '>';
		}
		public GetInitTag(Range: IRange): string {
			var ElementClasses = new Array();
			if (Range.From[0]) {
				ElementClasses.push('cut_top')
			}
			if (Range.To[0] < this.Childs.length - 1) {
				ElementClasses.push('cut_bot')
			}
			if (this.Data.xp.length) {
				ElementClasses.push('xp_' + this.Data.xp.join('_'))
			}
			if (this.Data.nc) {
				ElementClasses.push(this.Data.nc)
			}

			var Out = '<' + this.TagName;
			if (ElementClasses.length) {
				Out += ' class="' + ElementClasses.join(' ') + '"';
			}

			//if (this.data.css) {
			//	out += ' style="' + this.data.css + '"';
			//}

			if (this.Data.i) {
				Out += ' id="' + this.Data.i + '"';
			}
			return Out + '>';

		}
	}
}