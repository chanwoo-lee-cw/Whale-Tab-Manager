const { getAllTabGroups, renameTabGroup, deleteTabGroup, deleteTabFromGroup, mergeTabGroups } = require('../src/tab-group');

beforeEach(() => { __resetChromeMock(); });

function makeGroup(id, name, tabs = []) {
  return { id, name, createdAt: Date.now(), tabs };
}
function makeTab(id, url = `https://${id}.com`) {
  return { id, title: id, url, favIconUrl: '' };
}
async function seedGroups(groups) {
  await chrome.storage.local.set({ tabGroups: groups });
}

describe('getAllTabGroups', () => {
  test('storage가 비어 있으면 빈 배열을 반환한다', async () => {
    expect(await getAllTabGroups()).toEqual([]);
  });
  test('저장된 그룹 목록을 그대로 반환한다', async () => {
    await seedGroups([makeGroup('g1', '그룹1', [makeTab('t1')])]);
    const groups = await getAllTabGroups();
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('g1');
  });
});

describe('renameTabGroup', () => {
  test('그룹 이름 변경 후 storage에 반영된다', async () => {
    await seedGroups([makeGroup('g1', '원래 이름')]);
    await renameTabGroup('g1', '새 이름');
    expect((await getAllTabGroups())[0].name).toBe('새 이름');
  });
  test('존재하지 않는 groupId는 무시한다', async () => {
    await seedGroups([makeGroup('g1', '이름')]);
    await renameTabGroup('없는ID', '새 이름');
    expect((await getAllTabGroups())[0].name).toBe('이름');
  });
  test('빈 문자열로 변경 시 기존 이름을 유지한다', async () => {
    await seedGroups([makeGroup('g1', '원래 이름')]);
    await renameTabGroup('g1', '   ');
    expect((await getAllTabGroups())[0].name).toBe('원래 이름');
  });
});

describe('deleteTabGroup', () => {
  test('그룹 삭제 후 storage에서 제거된다', async () => {
    await seedGroups([makeGroup('g1', '그룹1'), makeGroup('g2', '그룹2')]);
    await deleteTabGroup('g1');
    const groups = await getAllTabGroups();
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('g2');
  });
  test('존재하지 않는 groupId는 무시한다', async () => {
    await seedGroups([makeGroup('g1', '그룹1')]);
    await deleteTabGroup('없는ID');
    expect(await getAllTabGroups()).toHaveLength(1);
  });
});

describe('deleteTabFromGroup', () => {
  test('탭 삭제 후 해당 탭만 제거되고 그룹은 유지된다', async () => {
    await seedGroups([makeGroup('g1', '그룹1', [makeTab('t1'), makeTab('t2')])]);
    await deleteTabFromGroup('g1', 't1');
    const groups = await getAllTabGroups();
    expect(groups).toHaveLength(1);
    expect(groups[0].tabs).toHaveLength(1);
    expect(groups[0].tabs[0].id).toBe('t2');
  });
  test('그룹 내 마지막 탭 삭제 시 그룹도 함께 삭제된다', async () => {
    await seedGroups([makeGroup('g1', '그룹1', [makeTab('t1')])]);
    await deleteTabFromGroup('g1', 't1');
    expect(await getAllTabGroups()).toHaveLength(0);
  });
  test('존재하지 않는 groupId는 무시한다', async () => {
    await seedGroups([makeGroup('g1', '그룹1', [makeTab('t1')])]);
    await deleteTabFromGroup('없는ID', 't1');
    expect((await getAllTabGroups())[0].tabs).toHaveLength(1);
  });
});

describe('mergeTabGroups', () => {
  test('두 그룹 선택 후 병합 시 1개의 그룹으로 합쳐진다', async () => {
    await seedGroups([
      makeGroup('g1', '그룹1', [makeTab('t1')]),
      makeGroup('g2', '그룹2', [makeTab('t2')]),
    ]);
    await mergeTabGroups(['g1', 'g2'], '병합 그룹');
    const groups = await getAllTabGroups();
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('병합 그룹');
    expect(groups[0].tabs).toHaveLength(2);
  });

  test('병합 후 원본 그룹 두 개가 삭제된다', async () => {
    await seedGroups([
      makeGroup('g1', '그룹1', [makeTab('t1')]),
      makeGroup('g2', '그룹2', [makeTab('t2')]),
      makeGroup('g3', '그룹3', [makeTab('t3')]),
    ]);
    await mergeTabGroups(['g1', 'g2'], '병합');
    const groups = await getAllTabGroups();
    expect(groups).toHaveLength(2);
    expect(groups.find(g => g.id === 'g3')).toBeTruthy();
  });

  test('병합된 탭은 첫 번째 그룹 탭 + 두 번째 그룹 탭 순서로 합쳐진다', async () => {
    await seedGroups([
      makeGroup('g1', '그룹1', [makeTab('t1', 'https://a.com')]),
      makeGroup('g2', '그룹2', [makeTab('t2', 'https://b.com')]),
    ]);
    await mergeTabGroups(['g1', 'g2'], '병합');
    const groups = await getAllTabGroups();
    expect(groups[0].tabs[0].url).toBe('https://a.com');
    expect(groups[0].tabs[1].url).toBe('https://b.com');
  });

  test('그룹 1개만 선택 시 병합을 실행하지 않는다', async () => {
    await seedGroups([makeGroup('g1', '그룹1', [makeTab('t1')])]);
    await mergeTabGroups(['g1'], '병합');
    expect(await getAllTabGroups()).toHaveLength(1);
  });

  test('병합 이름을 지정하지 않으면 첫 번째 그룹 이름이 사용된다', async () => {
    await seedGroups([
      makeGroup('g1', '첫 번째', [makeTab('t1')]),
      makeGroup('g2', '두 번째', [makeTab('t2')]),
    ]);
    await mergeTabGroups(['g1', 'g2'], '');
    const groups = await getAllTabGroups();
    expect(groups[0].name).toBe('첫 번째');
  });
});

describe('그룹 정렬', () => {
  test('storage에 저장된 순서(최신순)대로 반환된다', async () => {
    const older = { ...makeGroup('g1', '오래된 그룹'), createdAt: Date.now() - 10000 };
    const newer = { ...makeGroup('g2', '최신 그룹'), createdAt: Date.now() };
    await seedGroups([newer, older]);
    const groups = await getAllTabGroups();
    expect(groups[0].id).toBe('g2');
    expect(groups[1].id).toBe('g1');
  });
});
