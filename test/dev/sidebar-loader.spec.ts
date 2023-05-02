// import {
//   isCompatibleWithPlatform,
//   pickSidebarVersion
// } from "../../src/acrolinx-sidebar-integration/utils/sidebar-loader";
//
// describe('getSidebarVersion', () => {
//   it.each`
//     minimumSidebarVersion | platformVersion | expected
//     ${[16]}                | ${'2023.06'}    | ${15}
//     ${[14]}                | ${'2023.06'}    | ${14}
//     ${[]}                  | ${'2023.06'}    | ${15}
//   `('returns $expected when minimumSidebarVersion is $minimumSidebarVersion and platformVersion is $platformVersion', ({ minimumSidebarVersion, platformVersion, expected }) => {
//     expect(pickSidebarVersion(minimumSidebarVersion, platformVersion)).toEqual(expected);
//   });
// });
//
// describe('isCompatibleWithPlatform', () => {
//   it.each`
//     sidebarVersion | platformVersion | expected
//     ${15}           | ${'2023.06'}    | ${true}
//     ${16}           | ${'2023.06'}    | ${false}
//   `('returns $expected when sidebarVersion is $sidebarVersion and platformVersion is $platformVersion', ({ sidebarVersion, platformVersion, expected }) => {
//     expect(isCompatibleWithPlatform(sidebarVersion, platformVersion)).toBe(expected);
//   });
// });
