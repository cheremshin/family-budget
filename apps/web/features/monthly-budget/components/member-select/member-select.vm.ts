import { computed, makeObservable } from 'mobx';

import type { MemberSelection, ReadySource } from '../../model/ports';
import { type MemberSelectView, buildMemberSelectView } from './member-select.view';

export class MemberSelectVM {
    constructor(
        private readonly ready: ReadySource,
        private readonly selection: MemberSelection,
    ) {
        makeObservable(this);
    }

    @computed
    get view(): MemberSelectView {
        return buildMemberSelectView(this.ready.snapshot);
    }

    select = (memberId: string): void => this.selection.selectMember(memberId);
}
