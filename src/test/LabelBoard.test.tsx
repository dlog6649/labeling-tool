import React from "react";
import { render, fireEvent } from "@testing-library/react";
import LabelBoard from "./LabelBoard";
import { LabelMode.SELECT, LabelMode.CREATE } from "../modules/annotator";
import { parseTransform } from "../util/common";

type Labels = {
  id: number;
  name: string;
  coordinates: { x: number; y: number }[];
  data: { x: number; y: number; w: number; h: number; deg: number };
}[];

interface Props {
  mode: string;
  image: any;
  currentImgURL: string;
  labels: Labels;
  selectedLabelsIds: number[];
}

interface Data {
  x: number;
  y: number;
  scale: number;
  deg: number;
  rotX: number;
  rotY: number;
  w: number;
  h: number;
}

describe("LabelBoard 라벨링툴 테스트 시작", () => {
  let wrapper: any = null;
  const _currentImgURL = "http://sample.png";
  const _selectedLabelsIds: number[] = [];
  const _image: { title: string; x: number; y: number; scale: number } = { title: "Lorem ipsum", x: 0, y: 0, scale: 1 };
  const _labels: Labels = [
    {
      id: 0,
      name: "sea",
      coordinates: [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 50, y: 50 },
        { x: 0, y: 50 },
      ],
      data: { x: 0, y: 0, w: 50, h: 50, deg: 0 },
    },
    {
      id: 1,
      name: "woods",
      coordinates: [
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 50 },
      ],
      data: { x: 50, y: 0, w: 50, h: 50, deg: 0 },
    },
    {
      id: 2,
      name: "building",
      coordinates: [
        { x: 0, y: 50 },
        { x: 50, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      data: { x: 0, y: 50, w: 50, h: 50, deg: 0 },
    },
  ];
  const mouseDown = new Event("mousedown");
  Object.defineProperty(mouseDown, "button", { get: () => 0 });
  Object.defineProperty(mouseDown, "offsetX", { get: () => 0 });
  Object.defineProperty(mouseDown, "offsetY", { get: () => 0 });
  const mouseMove = new Event("mousemove");
  Object.defineProperty(mouseMove, "offsetX", { get: () => 200 });
  Object.defineProperty(mouseMove, "offsetY", { get: () => 200 });

  it("렌더링이 된 결과가 기존 스냅샷과 비교해서 일치해야 한다.", () => {
    wrapper = render(
      <LabelBoard mode={LabelMode.SELECT} currentImgURL={_currentImgURL} selectedLabelsIds={_selectedLabelsIds} image={_image} labels={_labels} />,
    );
    expect(wrapper.baseElement).toMatchSnapshot();
  });

  describe("라벨 생성모드", () => {
    it("라링보드에 드래그를 하면 라벨과 클래스입력창이 생성되고, 생성된 라벨은 디스패치된다.", () => {
      const mockCreateLabels = jest.fn();
      wrapper = render(
        <LabelBoard
          mode={LabelMode.CREATE}
          currentImgURL={_currentImgURL}
          selectedLabelsIds={[]}
          image={_image}
          labels={[]}
          createLabels={mockCreateLabels}
        />,
      );
      const labelingBoard = wrapper.getByTestId("testSvg");

      // 라벨링보드에 드래그
      fireEvent(labelingBoard, mouseDown);
      fireEvent(labelingBoard, mouseMove);
      fireEvent.mouseUp(labelingBoard);

      const testLabels = wrapper.getAllByTestId("testLabel");
      const inputForms = wrapper.getAllByPlaceholderText("Input Class name");
      const createLabelsEventByMouseUp = mockCreateLabels.mock.calls;
      const [labels] = createLabelsEventByMouseUp[0];
      expect(testLabels).toHaveLength(1);
      expect(inputForms).toHaveLength(1);
      expect(labels).toHaveLength(1);
    });

    it("생성된 라벨의 클래스 입력창에 문자를 입력 후 엔터키를 누르면 클래스명이 부여되고, 해당 라벨은 디스패치된다.", () => {
      const mockCreateLabels = jest.fn();
      const mockUpdateLabels = jest.fn();
      wrapper = render(
        <LabelBoard
          mode={LabelMode.CREATE}
          currentImgURL={_currentImgURL}
          selectedLabelsIds={[]}
          image={_image}
          labels={[]}
          createLabels={mockCreateLabels}
          updateLabels={mockUpdateLabels}
        />,
      );
      const labelingBoard = wrapper.getByTestId("testSvg");

      fireEvent(labelingBoard, mousDown);
      fireEvent(labelingBoard, mouseMove);
      fireEvent.mouseUp(labelingBoard);

      const inputForm = wrapper.getByPlaceholderText("Input Class name");
      inputForm.value = "new class name";
      fireEvent.keyDown(inputForm, { keyCode: 13 }); // enter키 입력

      const updateLabelsEventByKeyDown = mockUpdateLabels.mock.calls[0];
      const [labels] = updateLabelsEventByKeyDown;
      expect(labels[0].dataset.name).toEqual("new class name");
    });
  });

  describe("라벨 선택모드", () => {
    it("라벨을 클릭하면 라벨이 선택되며 앵커가 표시된다. 그리고 선택된 라벨의 ID는 디스패치된다.", () => {
      const mockUpdateLabels = jest.fn();

      // 기본값으로 라벨 3개 전달
      wrapper = render(
        <LabelBoard
          mode={LabelMode.SELECT}
          currentImgURL={_currentImgURL}
          selectedLabelsIds={[]}
          image={_image}
          labels={_labels}
          updateLabels={mockUpdateLabels}
        />,
      );
      const testLabels = wrapper.getAllByTestId("testLabel");

      // 0번 라벨 클릭
      fireEven.mouseDown(testLabels[0].firstChild);
      fireEvent.mouseUp(testLabels[0].firstChild);

      const updateLabelsEventByMouseUp = mockUpdateLabels.mock.calls;
      const [labels, selectedLabelsIds] = updateLabelsEventByMouseUp[0];
      expect(testLabels[0].classList.contains("selected")).toBe(true);
      expect(selectedLabelsIds).toEqual([0]);
    });

    it("컨트롤키를 누르고 라벨 클릭 시 다중선택이 가능해진다. 그리고 선택된 라벨들의 ID는 디스패치된다.", () => {
      const mockUpdateLabels = jest.fn();

      // 기본값으로 라벨 3개 전달
      wrapper = render(
        <LabelBoard
          mode={LabelMode.SELECT}
          currentImgURL={_currentImgURL}
          selectedLabelsIds={[]}
          image={_image}
          labels={_labels}
          updateLabels={mockUpdateLabels}
        />,
      );
      const testLabels = wrapper.getAllByTestId("testLabel");

      // 0, 1번 라벨 클릭
      fireEent.mouseDown(testLabels[0].firstChild, { ctrlKey: true });
      fireEvent.mouseUp(testLabels[0].firstChild);
      fireEvent.mouseDown(testLabels[1].firstChild, { ctrlKey: true });
      fireEvent.mouseUp(testLabels[1].firstChild);

      const updateLabelsEventByMouseUp = mockUpdateLabels.mock.calls;
      const [labels, selectedLabelsIds] = updateLabelsEventByMouseUp[1];
      expect(testLabels[0].classList.contains("selected")).toBe(true);
      expect(testLabels[1].classList.contains("selected")).toBe(true);
      expect(selectedLabelsIds).toEqual([0, 1]);
    });

    it("라벨을 클릭 후 delete키 또는 backspace키를 누를 시 삭제된다. 그리고 삭제된 라벨들의 ID는 디스패치된다.", () => {
      const mockUpdateLabels = jest.fn();
      const mockDeleteLabels = jest.fn();

      // 기본값으로 라벨 3개 전달
      wrapper = render(
        <LabelBoard
          mode={LabelMode.SELECT}
          currentImgURL={_currentImgURL}
          selectedLabelsIds={[]}
          image={_image}
          labels={_labels}
          updateLabels={mockUpdateLabels}
          deleteLabels={mockDeleteLabels}
        />,
      );
      const testLabels = wrapper.getAllByTestId("testLabel");

      // 0번 라벨 클릭 후 delete키 입력
      fireEvent.mouseDown(testLabels[0].firstChild);
      fireEvent.mouseUp(testLabels[0].firstChild);
      fireEvent.keyDown(document, { which: 46, keyCode: 46 });

      // 1번 라벨 클릭 후 backspace키 입력
      fireEvent.mouseDown(testLabels[1].firstChild);
      fireEvent.mouseUp(testLabels[1].firstChild);
      fireEvent.keyDown(document, { which: 8, keyCode: 8 });

      const deleteLabelsEventByMouseDown = mockDeleteLabels.mock.calls;
      let [selectedLabelsIds] = deleteLabelsEventByMouseDown[0];
      expect(selectedLabelsIds).toEqual([0]);
      [selectedLabelsIds] = deleteLabelsEventByMouseDown[1];
      expect(selectedLabelsIds).toEqual([1]);
    });

    it("라벨을 드래그시 선택된 라벨의 위치가 이동된다. 그리고 라벨들은 디스패치된다.", () => {
      const mockUpdateLabels = jest.fn();

      // 기본값으로 라벨 3개 전달
      wrapper = render(
        <LabelBoard
          mode={LabelMode.SELECT}
          currentImgURL={_currentImgURL}
          selectedLabelsIds={[]}
          image={_image}
          labels={_labels}
          updateLabels={mockUpdateLabels}
        />,
      );
      const labelingBoard = wrapper.getByTestId("testSvg");
      const testLabels = wrapper.getAlByTestId("testLabel");
      const beforeLabel: {
        x: number;
        y: number;
        scale: number;
        deg: number;
        rotX: number;
        rotY: number;
        w: number;
        h: number;
      } = parseTransform(testLabels[0]) as Data;
      expect(beforeLabel.x).toBe(0);
      expect(beforeLabel.y).toBe(0);

      // 0번 라벨 드래그
      fireEvent(testLabels[0].firstChild, mouseDown);
      fireEvent(labelingBoard, mouseMove);
      fireEvent.mouseUp(testLabels[0].firstChild);

      const updateLabelsEventByMouseDown = mockUpdateLabels.mock.calls;
      const [labels, selectedLabelsIds] = updateLabelsEventByMouseDown[0];
      const afterLabel = parseTransform(labels[0]) as Data;
      expect(afterLabel.x).toBe(200);
      expect(afterLabel.y).toBe(200);
    });

    it("라벨을 클릭하여 표시된 앵커를 드래그시 크기가 변경된다. 그리고 라벨들은 디스패치된다.", () => {
      const mockUpdateLabels = jest.fn();

      // 기본값으로 라벨 3개 전달
      wrapper = render(
        <LabelBoard
          mode={LabelMode.SELECT}
          currentImgURL={_currentImgURL}
          selectedLabelsIds={[]}
          image={_image}
          labels={_labels}
          updateLabels={mockUpdateLabels}
        />,
      );
      const labelingBoard = wrapper.getByTestId("testSvg");
      const testLabels = wrapper.getAlByTestId("testLabel");
      // 0번 라벨의 위치 (0, 0)
      const beforeWidth = parseFloat(testLabels[0].firstChild.getAttribute("width"));
      const beforeHeight = parseFloat(testLabels[0].firstChild.getAttribute("height"));
      expect(beforeWidth).toBe(50);
      expect(beforeHeight).toBe(50);

      // 0번 라벨 클릭
      fireEvent(testLabels[0].firstChild, mouseDown);
      fireEvent.mouseUp(testLabels[0].firstChild);

      // 좌측상단 앵커를 (200, 200)으로 드래그
      const nwAnchor = testLabels[0].firstChild.nextSibling.nextSibling.nextSibling;
      fireEvent(nwAnchor, mouseDown);
      fireEvent(labelingBoard, mouseMove);
      fireEvent.mouseUp(nwAnchor);

      const updateLabelsEventByMouseDown = mockUpdateLabels.mock.calls;
      const [labels, selectedLabelsIds] = updateLabelsEventByMouseDown[1];
      const afterWidth = parseFloat(labels[0].firstChild.getAttribute("width"));
      const afterHeight = parseFloat(labels[0].firstChild.getAttribute("height"));
      expect(afterWidth).toBe(150);
      expect(afterHeight).toBe(150);
    });
  });

  describe("아무 모드에서나 가능한 기능 테스트", () => {
    it("우측하단의 Slider나 마우스휠을 이용해서 이미지와 라벨들을 확대 및 축소할 수 있다. 그리고 이미지와 라벨들은 디스패치된다.", () => {
      const mockCreateLabels = jest.fn();
      const mockUpdateLabels = jest.fn();
      const mockUpdateImgLabels = jest.fn();
      const mockSelectLabels = jest.fn();

      // 기본값으로 라벨 3개 전달
      wrapper = render(
        <LabelBoard
          mode={LabelMode.SELECT}
          currentImgURL={_currentImgURL}
          selectedLabelsIds={[]}
          image={_image}
          labels={_labels}
          createLabels={mockCreateLabels}
          updateLabels={mockUpdateLabels}
          selectLabels={mockSelectLabels}
          updateImgLabels={mockUpdateImgLabels}
        />,
      );
      const labelingBoard = wrapper.getByTestId("testSvg");
      const testScaler = wrapper.getBTestId("testScaler");
      const testImg = wrapper.getByTestId("testImg");
      const testLabels = wrapper.getAllByTestId("testLabel");

      // 슬라이더의 scale값을 1.5로 변경
      testScaler.value = 1.5;
      fireEvent.change(testScaler);

      const beforeTestImg = parseTransform(testImg) as Data;
      const beforeTestLabel = parseTransform(testLabels[0]) as Data;
      expect(beforeTestImg.scale).toBe(1.5);
      expect(beforeTestLabel.scale).toBe(1.5);

      // 라벨링보드에서 마우스휠 회전
      fireEvent(labelingBoard, new MouseEvent("mousewheel", { deltaY: -100 }));

      const afterTestImg = parseTransform(testImg) as Data;
      const afterTestLabel = parseTransform(testLabels[0]) as Data;
      expect(afterTestImg.scale).toBe(1.6);
      expect(afterTestLabel.scale).toBe(1.6);

      const updateImgLabelsEventByMouseWheel = mockUpdateImgLabels.mock.calls;
      const [img, labels] = updateImgLabelsEventByMouseWheel[1];
      const afterImg = parseTransform(img) as Data;
      const afterLabel = parseTransform(labels[0]) as Data;
      expect(afterImg.scale).toBe(1.6);
      expect(afterLabel.scale).toBe(1.6);
    });

    it("스페이스바를 누른 상태에서 이미지를 드래그시 이미지와 라벨들의 위치가 이동된다. 그리고 이미지와 라벨들은 디스패치된다.", () => {
      const mockCreateLabels = jest.fn();
      const mockUpdateLabels = jest.fn();
      const mockUpdateImgLabels = jest.fn();
      const mockSelectLabels = jest.fn();

      // 기본값으로 라벨 3개 전달
      wrapper = render(
        <LabelBoard
          mode={LabelMode.SELECT}
          currentImgURL={_currentImgURL}
          selectedLabelsIds={[]}
          image={_image}
          labels={_labels}
          createLabels={mockCreateLabels}
          updateLabels={mockUpdateLabels}
          selectLabels={mockSelectLabels}
          updateImgLabels={mockUpdateImgLabels}
        />,
      );
      const labelingBoard = wrapper.getByTestId("testSvg");
      const testImg = wrapper.getByTetId("testImg");
      const testLabels = wrapper.getAllByTestId("testLabel");
      const beforeImg = parseTransform(testImg) as Data;
      const beforeLabel = parseTransform(testLabels[0]) as Data;
      expect(beforeImg.x).toBe(0);
      expect(beforeImg.y).toBe(0);
      expect(beforeLabel.x).toBe(0);
      expect(beforeLabel.y).toBe(0);

      // 스페이스바를 누른 상태로 드래그
      fireEvent.keyDown(document, { which: 32, keyCode: 32 });
      fireEvent(labelingBoard, mouseDown);
      fireEvent(labelingBoard, mouseMove);
      fireEvent.mouseUp(labelingBoard);

      const updateImgLabelsEventByMouseUp = mockUpdateImgLabels.mock.calls;
      const [img, labels] = updateImgLabelsEventByMouseUp[0];
      const afterImg = parseTransform(img) as Data;
      const afterLabel = parseTransform(labels[0]) as Data;
      expect(afterImg.x).toBe(200);
      expect(afterImg.y).toBe(200);
      expect(afterLabel.x).toBe(200);
      expect(afterLabel.y).toBe(200);
    });
  });
});
